import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { eventsForYear, generateCalendar } from "@daymark/calendar";

const calendarPath = "/calendar/daymark.ics";
const productOrigin = "https://daymark.agentclub.dev";
const calendarOrigin = (process.env.DAYMARK_CALENDAR_ORIGIN || productOrigin).replace(/\/+$/, "");
const calendarUrl = `${calendarOrigin}${calendarPath}`;
const generatedAt = new Date();
const ics = generateCalendar({ now: generatedAt });
const eventCount = ics.match(/^BEGIN:VEVENT\r$/gm)?.length ?? 0;
const template = await readFile("index.html", "utf8");
const eventYears = yearsAround(generatedAt);
const siteEvents = eventYears.flatMap((year) =>
  eventsForYear(year, toUtcStamp(generatedAt)).map(({ summary, date, endDate }) => ({
    summary,
    date,
    endDate,
  })),
);

await mkdir("dist/calendar", { recursive: true });
await cp("assets", "dist/assets", { recursive: true });
await writeFile("dist/calendar/daymark.ics", ics, "utf8");
await writeFile(
  "dist/_headers",
  [
    "/calendar/*.ics",
    "  Content-Type: text/calendar; charset=utf-8",
    "  Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    "",
  ].join("\n"),
  "utf8",
);
await writeFile(
  "dist/index.html",
  renderTemplate(template, {
    CALENDAR_PATH: calendarPath,
    CALENDAR_PATH_JSON: scriptJson(calendarPath),
    CALENDAR_URL: escapeHtml(calendarUrl),
    CALENDAR_URL_ATTR: escapeAttribute(calendarUrl),
    CALENDAR_URL_JSON: scriptJson(calendarUrl),
    EVENT_COUNT: String(eventCount),
    EVENTS_JSON: scriptJson(siteEvents),
    GENERATED_TIME: escapeHtml(formatGeneratedTime(generatedAt)),
  }),
  "utf8",
);

console.log("Generated apps/docs/dist");

function renderTemplate(template, replacements) {
  return Object.entries(replacements).reduce(
    (html, [key, value]) => html.replaceAll(`__${key}__`, value),
    template,
  );
}

function formatGeneratedTime(date) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Shanghai",
  }).format(date);
}

function yearsAround(date) {
  const currentYear = date.getUTCFullYear();
  const years = [];
  for (let year = currentYear - 1; year <= currentYear + 3; year += 1) {
    years.push(year);
  }
  return years;
}

function toUtcStamp(date) {
  return date.toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}Z$/, "Z");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>]/g, (character) => {
    if (character === "&") return "&amp;";
    if (character === "<") return "&lt;";
    return "&gt;";
  });
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function scriptJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
