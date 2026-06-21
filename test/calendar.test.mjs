import assert from "node:assert/strict";
import { generateCalendar, eventsForYear } from "../src/calendar.js";
import worker from "../src/worker.js";

const ics = generateCalendar({ now: new Date(Date.UTC(2026, 5, 20)), pastYears: 0, futureYears: 0 });

assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"));
assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
assert.ok(ics.includes("VERSION:2.0\r\n"));
assert.ok(ics.includes("CALSCALE:GREGORIAN\r\n"));
assert.ok(ics.includes("METHOD:PUBLISH\r\n"));
assert.ok(ics.includes("X-WR-CALNAME:★ Daymark\r\n"));
assert.ok(ics.includes("X-WR-TIMEZONE:Asia/Shanghai\r\n"));
assert.ok(ics.includes("X-WR-CALDESC:中国节日、纪念日、节气、休班提醒\r\n"));
assert.ok(ics.includes("X-APPLE-CALENDAR-COLOR:#F59E0B\r\n"));
assert.ok(ics.includes("BEGIN:VTIMEZONE\r\n"));
assert.ok(ics.includes("TZID:Asia/Shanghai\r\n"));
assert.ok(ics.includes("END:VTIMEZONE\r\n"));
assert.ok(ics.includes("BEGIN:VEVENT\r\n"));
assert.ok(ics.includes("DTSTART;VALUE=DATE:"));
assert.ok(ics.includes("DTEND;VALUE=DATE:"));

const events = eventsForYear(2026, "20260620T000000Z");
const uids = events.map((event) => event.uid);
const eventsBySummary = new Map(events.map((event) => [event.summary, event.date]));
const eventBySummary = new Map(events.map((event) => [event.summary, event]));
const datesBySummary = new Map();
for (const event of events) {
  datesBySummary.set(event.summary, [...(datesBySummary.get(event.summary) ?? []), event.date]);
}

function assertEventRange(summary, date, endDate) {
  const event = eventBySummary.get(summary);
  assert.equal(event.date, date);
  assert.equal(event.endDate, endDate);
}

function assertNoEvent(summary) {
  assert.equal(eventsBySummary.has(summary), false);
}

function summariesActiveOn(date) {
  return events
    .filter((event) => event.date <= date && date < event.endDate)
    .map((event) => event.summary)
    .sort();
}

assert.equal(events.length, 109);
assert.equal(uids.length, new Set(uids).size);

assertNoEvent("元旦");
assert.equal(eventsBySummary.get("中国人民警察节"), "2026-01-10");
assert.equal(eventsBySummary.get("腊八节"), "2026-01-26");
assert.equal(eventsBySummary.get("二七纪念日"), "2026-02-07");
assert.equal(eventsBySummary.get("北小年"), "2026-02-10");
assert.equal(eventsBySummary.get("南小年"), "2026-02-11");
assertNoEvent("除夕");
assertNoEvent("春节");
assertNoEvent("春节初二");
assertNoEvent("春节初三");
assert.equal(eventsBySummary.get("情人节"), "2026-02-14");
assert.equal(eventsBySummary.get("人日"), "2026-02-23");
assert.equal(eventsBySummary.get("元宵节"), "2026-03-03");
assert.equal(eventsBySummary.get("全国爱耳日"), "2026-03-03");
assert.equal(eventsBySummary.get("妇女节"), "2026-03-08");
assert.equal(eventsBySummary.get("植树节"), "2026-03-12");
assert.equal(eventsBySummary.get("龙抬头"), "2026-03-20");
assert.equal(eventsBySummary.get("社日节"), "2026-03-20");
assert.equal(eventsBySummary.get("花朝节"), "2026-03-20");
assert.equal(eventsBySummary.get("全国中小学生安全教育日"), "2026-03-30");
assert.equal(eventsBySummary.get("愚人节"), "2026-04-01");
assert.equal(eventsBySummary.get("寒食节"), "2026-04-04");
assertNoEvent("清明节");
assert.equal(eventsBySummary.get("全民国家安全教育日"), "2026-04-15");
assert.equal(eventsBySummary.get("上巳节"), "2026-04-19");
assert.equal(eventsBySummary.get("中国航天日"), "2026-04-24");
assertNoEvent("劳动节");
assertNoEvent("劳动节第二天");
assert.equal(eventsBySummary.get("青年节"), "2026-05-04");
assert.equal(eventsBySummary.get("母亲节"), "2026-05-10");
assert.equal(eventsBySummary.get("护士节"), "2026-05-12");
assert.equal(eventsBySummary.get("全国助残日"), "2026-05-17");
assert.equal(eventsBySummary.get("中国旅游日"), "2026-05-19");
assert.equal(eventsBySummary.get("五卅纪念日"), "2026-05-30");
assert.equal(eventsBySummary.get("全国科技工作者日"), "2026-05-30");
assert.equal(eventsBySummary.get("儿童节"), "2026-06-01");
assert.equal(eventsBySummary.get("全国爱眼日"), "2026-06-06");
assert.equal(eventsBySummary.get("文化和自然遗产日"), "2026-06-13");
assert.equal(eventsBySummary.get("父亲节"), "2026-06-21");
assert.equal(eventsBySummary.get("全国土地日"), "2026-06-25");
assert.equal(eventsBySummary.get("建党节"), "2026-07-01");
assert.equal(eventsBySummary.get("小寒"), "2026-01-05");
assert.equal(eventsBySummary.get("大寒"), "2026-01-20");
assert.equal(eventsBySummary.get("立春"), "2026-02-04");
assert.equal(eventsBySummary.get("雨水"), "2026-02-19");
assert.equal(eventsBySummary.get("惊蛰"), "2026-03-05");
assert.equal(eventsBySummary.get("春分"), "2026-03-20");
assert.equal(eventsBySummary.get("清明"), "2026-04-05");
assert.equal(eventsBySummary.get("谷雨"), "2026-04-20");
assert.equal(eventsBySummary.get("立夏"), "2026-05-05");
assert.equal(eventsBySummary.get("小满"), "2026-05-21");
assert.equal(eventsBySummary.get("芒种"), "2026-06-05");
assert.equal(eventsBySummary.get("夏至"), "2026-06-21");
assert.equal(eventsBySummary.get("小暑"), "2026-07-07");
assert.equal(eventsBySummary.get("大暑"), "2026-07-23");
assert.equal(eventsBySummary.get("立秋"), "2026-08-07");
assert.equal(eventsBySummary.get("处暑"), "2026-08-23");
assert.equal(eventsBySummary.get("白露"), "2026-09-07");
assert.equal(eventsBySummary.get("秋分"), "2026-09-23");
assert.equal(eventsBySummary.get("寒露"), "2026-10-08");
assert.equal(eventsBySummary.get("霜降"), "2026-10-23");
assert.equal(eventsBySummary.get("立冬"), "2026-11-07");
assert.equal(eventsBySummary.get("小雪"), "2026-11-22");
assert.equal(eventsBySummary.get("大雪"), "2026-12-07");
assert.equal(eventsBySummary.get("冬至"), "2026-12-22");
assert.equal(eventsBySummary.get("七七事变"), "2026-07-07");
assert.equal(eventsBySummary.get("七七抗战纪念日"), "2026-07-07");
assert.equal(eventsBySummary.get("中国航海日"), "2026-07-11");
assert.equal(eventsBySummary.get("抗美援朝战争胜利纪念日"), "2026-07-27");
assert.equal(eventsBySummary.get("中国人民解放军建军纪念日"), "2026-08-01");
assert.equal(eventsBySummary.get("全民健身日"), "2026-08-08");
assert.equal(eventsBySummary.get("日本宣布无条件投降"), "2026-08-15");
assert.equal(eventsBySummary.get("全国生态日"), "2026-08-15");
assert.equal(eventsBySummary.get("中国医师节"), "2026-08-19");
assert.equal(eventsBySummary.get("日本签署投降书"), "2026-09-02");
assert.equal(eventsBySummary.get("中国人民抗日战争胜利纪念日"), "2026-09-03");
assertNoEvent("端午节");
assert.equal(eventsBySummary.get("七夕节"), "2026-08-19");
assert.equal(eventsBySummary.get("中元节"), "2026-08-27");
assert.equal(eventsBySummary.get("教师节"), "2026-09-10");
assert.equal(eventsBySummary.get("九一八事变"), "2026-09-18");
assert.equal(eventsBySummary.get("九一八抗战纪念日"), "2026-09-18");
assert.equal(eventsBySummary.get("全民国防教育日"), "2026-09-19");
assert.equal(eventsBySummary.get("全国爱牙日"), "2026-09-20");
assert.equal(eventsBySummary.get("公民道德宣传日"), "2026-09-20");
assert.equal(eventsBySummary.get("中国农民丰收节"), "2026-09-23");
assertNoEvent("中秋节");
assert.equal(eventsBySummary.get("烈士纪念日"), "2026-09-30");
assertNoEvent("国庆节");
assertNoEvent("国庆节第二天");
assertNoEvent("国庆节第三天");
assert.equal(eventsBySummary.get("重阳节"), "2026-10-18");
assert.equal(eventsBySummary.get("老年节"), "2026-10-18");
assert.equal(eventsBySummary.get("ʚ1024ɞ"), "2026-10-24");
assert.equal(eventsBySummary.get("抗美援朝纪念日"), "2026-10-25");
assert.equal(eventsBySummary.get("台湾光复纪念日"), "2026-10-25");
assert.equal(eventsBySummary.get("万圣夜"), "2026-10-31");
assert.equal(eventsBySummary.get("万圣节"), "2026-11-01");
assert.equal(eventsBySummary.get("记者节"), "2026-11-08");
assert.equal(eventsBySummary.get("寒衣节"), "2026-11-09");
assert.equal(eventsBySummary.get("全国消防日"), "2026-11-09");
assert.equal(eventsBySummary.get("感恩节"), "2026-11-26");
assert.equal(eventsBySummary.get("下元节"), "2026-11-23");
assert.equal(eventsBySummary.get("全国交通安全日"), "2026-12-02");
assert.equal(eventsBySummary.get("全国法制宣传日"), "2026-12-04");
assert.equal(eventsBySummary.get("南京大屠杀死难者国家公祭日"), "2026-12-13");
assert.equal(eventsBySummary.get("澳门回归纪念日"), "2026-12-20");
assert.equal(eventsBySummary.get("平安夜"), "2026-12-24");
assert.equal(eventsBySummary.get("圣诞节"), "2026-12-25");

assertEventRange("元旦（休）", "2026-01-01", "2026-01-04");
assertEventRange("春节（休）", "2026-02-15", "2026-02-24");
assertEventRange("清明节（休）", "2026-04-04", "2026-04-07");
assertEventRange("劳动节（休）", "2026-05-01", "2026-05-06");
assertEventRange("端午节（休）", "2026-06-19", "2026-06-22");
assert.deepEqual(summariesActiveOn("2026-06-21"), ["夏至", "父亲节", "端午节（休）"]);
assert.deepEqual(summariesActiveOn("2026-09-23"), ["中国农民丰收节", "秋分"]);
assertEventRange("中秋节（休）", "2026-09-25", "2026-09-28");
assertEventRange("国庆节（休）", "2026-10-01", "2026-10-08");
assertNoEvent("冬一九");
assertNoEvent("冬二九");
assertNoEvent("冬三九");
assertNoEvent("冬九九");
assertNoEvent("初伏");
assertNoEvent("中伏");
assertNoEvent("末伏");
assert.deepEqual(datesBySummary.get("✦ 班"), [
  "2026-01-04",
  "2026-02-14",
  "2026-02-28",
  "2026-05-09",
  "2026-09-20",
  "2026-10-10",
]);

const events2022 = eventsForYear(2022, "20260620T000000Z");
assert.deepEqual(
  events2022.filter((event) => event.summary === "腊八节").map((event) => event.date),
  ["2022-01-10", "2022-12-30"],
);

const events2027WithRemoteSchedule = eventsForYear(2027, "20260620T000000Z", {
  2027: {
    holidays: [["remote-national-holiday", "国庆节假期", "2027-10-01", "2027-10-07"]],
    workdays: [
      ["remote-national-workday", "国庆节调休补班", "2027-09-26"],
      ["remote-national-workday", "国庆节调休补班", "2027-10-09"],
    ],
  },
});
const events2027BySummary = new Map(
  events2027WithRemoteSchedule.map((event) => [event.summary, event]),
);
const dates2027BySummary = new Map();
for (const event of events2027WithRemoteSchedule) {
  dates2027BySummary.set(event.summary, [
    ...(dates2027BySummary.get(event.summary) ?? []),
    event.date,
  ]);
}
assert.equal(events2027BySummary.get("国庆节（休）").date, "2027-10-01");
assert.equal(events2027BySummary.get("国庆节（休）").endDate, "2027-10-08");
assert.equal(events2027BySummary.has("国庆节"), false);
assert.deepEqual(dates2027BySummary.get("✦ 班"), ["2027-09-26", "2027-10-09"]);

const cacheStore = new Map();
globalThis.caches = {
  default: {
    async match(request) {
      return cacheStore.get(request.url)?.clone() ?? null;
    },
    async put(request, response) {
      cacheStore.set(request.url, response.clone());
    },
  },
};

const pendingTasks = [];
const ctx = {
  waitUntil(task) {
    pendingTasks.push(task);
  },
};
const originalFetch = globalThis.fetch;
const OriginalDate = globalThis.Date;
const fetchedHolidayYears = [];
globalThis.fetch = async (input) => {
  const url = new URL(typeof input === "string" ? input : input.url);
  if (url.origin !== "https://timor.tech" || !url.pathname.startsWith("/api/holiday/year/")) {
    throw new Error(`Unexpected fetch: ${url.toString()}`);
  }

  const year = Number(url.pathname.split("/").at(-1));
  fetchedHolidayYears.push(year);
  const holiday =
    year === 2027
      ? {
          "09-26": { holiday: false, name: "国庆节", date: "2027-09-26" },
          "10-01": { holiday: true, name: "国庆节", date: "2027-10-01" },
          "10-02": { holiday: true, name: "国庆节", date: "2027-10-02" },
          "10-03": { holiday: true, name: "国庆节", date: "2027-10-03" },
          "10-04": { holiday: true, name: "国庆节", date: "2027-10-04" },
          "10-05": { holiday: true, name: "国庆节", date: "2027-10-05" },
          "10-06": { holiday: true, name: "国庆节", date: "2027-10-06" },
          "10-07": { holiday: true, name: "国庆节", date: "2027-10-07" },
          "10-09": { holiday: false, name: "国庆节", date: "2027-10-09" },
        }
      : {};

  return new Response(JSON.stringify({ code: 0, holiday }), {
    headers: { "content-type": "application/json" },
  });
};

const calendarUrl = "https://calendar.example.test/calendar/daymark.ics";
globalThis.Date = class extends OriginalDate {
  constructor(...args) {
    if (args.length === 0) {
      super("2026-06-20T00:00:00.000Z");
      return;
    }
    super(...args);
  }

  static now() {
    return new OriginalDate("2026-06-20T00:00:00.000Z").getTime();
  }
};
cacheStore.set(
  calendarUrl,
  new Response("STALE CALENDAR\n", {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      etag: '"stale"',
    },
  }),
);

const calendarResponse = await worker.fetch(new Request(calendarUrl), {}, ctx);
assert.equal(calendarResponse.status, 200);
assert.equal(calendarResponse.headers.get("content-type"), "text/calendar; charset=utf-8");
const calendarBody = await calendarResponse.text();
assert.ok(calendarBody.startsWith("BEGIN:VCALENDAR\r\n"));
assert.ok(calendarBody.includes("SUMMARY:ʚ1024ɞ\r\n"));
assert.ok(!calendarBody.includes("SUMMARY:1024.\r\n"));
assert.ok(!calendarBody.includes("SUMMARY:1024\r\n"));
assert.ok(!calendarBody.includes("SUMMARY:1024 号\r\n"));
assert.ok(!calendarBody.includes("UID:20271001-remote-holiday-2027-10-01@daymark.example\r\n"));
assert.ok(calendarBody.includes("SUMMARY:✦ 班\r\n"));
assert.ok(!calendarBody.includes("SUMMARY:班\r\n"));
assert.ok(!calendarBody.includes("SUMMARY:↪ 班\r\n"));
assert.ok(!fetchedHolidayYears.includes(2025));
assert.ok(!fetchedHolidayYears.includes(2026));
assert.ok(!fetchedHolidayYears.includes(2027));
await Promise.all(pendingTasks);

const cachedEtag = calendarResponse.headers.get("etag");
const conditionalResponse = await worker.fetch(
  new Request(`${calendarUrl}?ignored=1`, {
    headers: { "if-none-match": cachedEtag },
  }),
  {},
  ctx,
);

assert.equal(conditionalResponse.status, 304);

cacheStore.clear();
pendingTasks.length = 0;
fetchedHolidayYears.length = 0;
globalThis.Date = class extends OriginalDate {
  constructor(...args) {
    if (args.length === 0) {
      super("2027-01-01T00:00:00.000Z");
      return;
    }
    super(...args);
  }

  static now() {
    return new OriginalDate("2027-01-01T00:00:00.000Z").getTime();
  }
};

const nextYearResponse = await worker.fetch(new Request(calendarUrl), {}, ctx);
assert.equal(nextYearResponse.status, 200);
const nextYearCalendarBody = await nextYearResponse.text();
assert.ok(nextYearCalendarBody.includes("DTSTART;VALUE=DATE:20271001\r\n"));
assert.ok(nextYearCalendarBody.includes("UID:20271001-remote-holiday-2027-10-01@daymark.example\r\n"));
assert.ok(nextYearCalendarBody.includes("SUMMARY:国庆节（休）\r\n"));
assert.ok(fetchedHolidayYears.includes(2027));
await Promise.all(pendingTasks);

let rateLimitKey = "";
const blockedResponse = await worker.fetch(
  new Request(calendarUrl, {
    headers: { "cf-connecting-ip": "203.0.113.10" },
  }),
  {
    CALENDAR_RATE_LIMITER: {
      async limit({ key }) {
        rateLimitKey = key;
        return { success: false };
      },
    },
  },
  ctx,
);

assert.equal(blockedResponse.status, 429);
assert.equal(rateLimitKey, "/calendar/daymark.ics:203.0.113.10");

delete globalThis.caches;
globalThis.fetch = originalFetch;
globalThis.Date = OriginalDate;

console.log("calendar tests passed");
