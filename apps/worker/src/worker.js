import { generateCalendar, hasLocalAdjustedHolidaySchedule } from "@daymark/calendar";

const CALENDAR_PATH = "/calendar/daymark.ics";
const CACHE_CONTROL = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";
const HOLIDAY_API_BASE_URL = "https://timor.tech/api/holiday/year";
const PUBLISHED_HOLIDAY_SCHEDULE_CACHE_SECONDS = 10 * 365 * 24 * 60 * 60;
const UNPUBLISHED_HOLIDAY_SCHEDULE_CACHE_SECONDS = 12 * 60 * 60;
const RATE_LIMITER_NAME = "CALENDAR_RATE_LIMITER";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/calendar") {
      return new Response("Daymark\n/calendar/daymark.ics\n", {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "public, max-age=3600",
        },
      });
    }

    if (url.pathname !== CALENDAR_PATH) {
      return new Response("Not found", { status: 404 });
    }

    const rateLimitResponse = await enforceCalendarRateLimit(request, env);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const now = calendarGenerationDate(new Date());
    const years = calendarYears(now);
    const adjustedSchedules = await adjustedHolidaySchedulesForYears(
      years,
      ctx,
      now.getUTCFullYear(),
    );
    const ics = generateCalendar({ now, adjustedSchedules });
    const etag = `"${hashString(ics)}"`;
    const headers = calendarHeaders({ etag, now });

    const cachedResponse = await getCachedCalendar(request, etag);
    if (cachedResponse) {
      const cachedEtag = cachedResponse.headers.get("etag");
      if (cachedEtag && request.headers.get("if-none-match") === cachedEtag) {
        return notModifiedResponse(cachedResponse.headers);
      }

      return cachedResponse;
    }

    if (request.headers.get("if-none-match") === etag) {
      return notModifiedResponse(headers);
    }

    const response = new Response(ics, { headers });
    cacheCalendar(request, response, ctx, etag);

    return response;
  },
};

async function adjustedHolidaySchedulesForYears(years, ctx, currentYear) {
  const publishedOrDueYears = years.filter((year) => year <= currentYear);
  const schedules = await Promise.all(
    publishedOrDueYears.map((year) => adjustedHolidayScheduleForYear(year, ctx)),
  );
  return Object.fromEntries(
    schedules
      .map((schedule, index) => [publishedOrDueYears[index], schedule])
      .filter(([, schedule]) => schedule),
  );
}

async function adjustedHolidayScheduleForYear(year, ctx) {
  if (hasLocalAdjustedHolidaySchedule(year)) {
    return null;
  }

  const cachedSchedule = await getCachedHolidaySchedule(year);
  if (cachedSchedule !== undefined) {
    return cachedSchedule;
  }

  let response;
  try {
    response = await fetch(`${HOLIDAY_API_BASE_URL}/${year}`, {
      headers: { accept: "application/json" },
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    return null;
  }

  const schedule = adjustedHolidayScheduleFromApi(year, payload);
  cacheHolidaySchedule(year, schedule, ctx);
  return schedule;
}

async function getCachedHolidaySchedule(year) {
  const cache = getCalendarCache();
  if (!cache) {
    return undefined;
  }

  const response = await cache.match(holidayScheduleCacheKey(year));
  if (!response) {
    return undefined;
  }

  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function cacheHolidaySchedule(year, schedule, ctx) {
  const cache = getCalendarCache();
  if (!cache) {
    return;
  }

  const write = cache.put(
    holidayScheduleCacheKey(year),
    new Response(JSON.stringify(schedule), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": `public, max-age=${holidayScheduleCacheSeconds(schedule)}`,
      },
    }),
  );
  if (ctx?.waitUntil) {
    ctx.waitUntil(write);
    return;
  }

  write.catch(() => {});
}

function holidayScheduleCacheSeconds(schedule) {
  return schedule
    ? PUBLISHED_HOLIDAY_SCHEDULE_CACHE_SECONDS
    : UNPUBLISHED_HOLIDAY_SCHEDULE_CACHE_SECONDS;
}

function adjustedHolidayScheduleFromApi(year, payload) {
  const days = Object.values(payload?.holiday ?? {})
    .filter((day) => day && typeof day.date === "string" && day.date.startsWith(`${year}-`))
    .sort((a, b) => a.date.localeCompare(b.date));

  const holidayRanges = holidayRangesFromApiDays(days.filter((day) => day.holiday === true));
  const workdays = days
    .filter((day) => day.holiday === false)
    .map((day) => [
      `remote-workday-${day.date}`,
      `${holidayNameFromApiDay(day)}调休补班`,
      day.date,
    ]);

  if (holidayRanges.length === 0 && workdays.length === 0) {
    return null;
  }

  return {
    holidays: holidayRanges,
    workdays,
  };
}

function holidayRangesFromApiDays(days) {
  const ranges = [];
  let range = [];

  for (const day of days) {
    const previous = range.at(-1);
    if (previous && addDays(previous.date, 1) !== day.date) {
      ranges.push(range);
      range = [];
    }
    range.push(day);
  }

  if (range.length > 0) {
    ranges.push(range);
  }

  return ranges.map((range) => {
    const startDate = range[0].date;
    const endDate = range.at(-1).date;
    const names = [...new Set(range.map(holidayNameFromApiDay))].filter(Boolean);
    const summary = `${names.join("、") || "法定节日"}假期`;
    return [`remote-holiday-${startDate}`, summary, startDate, endDate];
  });
}

function holidayNameFromApiDay(day) {
  return String(day.target || day.name || "法定节日")
    .replace(/假期$/, "")
    .replace(/调休补班$/, "")
    .replace(/前调休$/, "")
    .replace(/后调休$/, "")
    .trim();
}

async function enforceCalendarRateLimit(request, env) {
  const rateLimiter = env?.[RATE_LIMITER_NAME];
  if (!rateLimiter) {
    return null;
  }

  const { success } = await rateLimiter.limit({ key: calendarRateLimitKey(request) });
  if (success) {
    return null;
  }

  return new Response("Too many requests\n", {
    status: 429,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function calendarRateLimitKey(request) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  return `${CALENDAR_PATH}:${ip}`;
}

async function getCachedCalendar(request, etag) {
  const cache = getCalendarCache();
  if (!cache || request.method !== "GET") {
    return null;
  }

  return cache.match(calendarCacheKey(request, etag));
}

function cacheCalendar(request, response, ctx, etag) {
  const cache = getCalendarCache();
  if (!cache || request.method !== "GET") {
    return;
  }

  const write = cache.put(calendarCacheKey(request, etag), response.clone());
  if (ctx?.waitUntil) {
    ctx.waitUntil(write);
    return;
  }

  write.catch(() => {});
}

function getCalendarCache() {
  return globalThis.caches?.default;
}

function calendarCacheKey(request, etag) {
  const url = new URL(request.url);
  url.search = "";
  url.searchParams.set("__daymark_etag", etag);
  return new Request(url.toString(), { method: "GET" });
}

function calendarGenerationDate(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function calendarYears(now, pastYears = 1, futureYears = 3) {
  const currentYear = now.getUTCFullYear();
  const years = [];

  for (let year = currentYear - pastYears; year <= currentYear + futureYears; year += 1) {
    years.push(year);
  }

  return years;
}

function holidayScheduleCacheKey(year) {
  return new Request(`https://daymark.local/holiday-schedule/${year}`, { method: "GET" });
}

function addDays(date, days) {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function notModifiedResponse(headers) {
  return new Response(null, {
    status: 304,
    headers,
  });
}

function calendarHeaders({ etag, now }) {
  return {
    "content-type": "text/calendar; charset=utf-8",
    "content-disposition": 'inline; filename="daymark.ics"',
    "cache-control": CACHE_CONTROL,
    etag,
    "last-modified": now.toUTCString(),
    "x-content-type-options": "nosniff",
  };
}

function hashString(value) {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
