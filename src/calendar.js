const CALENDAR_NAME = "★ Daymark";
const CALENDAR_DESCRIPTION = "中国节日、纪念日、节气、休班提醒";
const PROD_ID = "-//daymark//Calendar//ZH-CN";
const UID_HOST = "daymark.example";
const COLOR = "#F59E0B";
const HOLIDAY_SUMMARY_SUFFIX = "（休）";
const WORKDAY_SUMMARY = "✦ 班";
const HOLIDAY_SUMMARIES_BY_BASE = {
  元旦: ["元旦"],
  春节: ["除夕", "春节", "春节初二", "春节初三"],
  清明节: ["清明节"],
  劳动节: ["劳动节", "劳动节第二天"],
  端午节: ["端午节"],
  中秋节: ["中秋节"],
  国庆节: ["国庆节", "国庆节第二天", "国庆节第三天"],
};
const CHINESE_CALENDAR = new Intl.DateTimeFormat("en-US-u-ca-chinese", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const FIXED_SOLAR_EVENTS = [
  ["new-year", "元旦", 1, 1],
  ["chinese-peoples-police-day", "中国人民警察节", 1, 10],
  ["erqi-memorial-day", "二七纪念日", 2, 7],
  ["valentines-day", "情人节", 2, 14],
  ["national-ear-care-day", "全国爱耳日", 3, 3],
  ["womens-day", "妇女节", 3, 8],
  ["tree-planting-day", "植树节", 3, 12],
  ["april-fools-day", "愚人节", 4, 1],
  ["national-security-education-day", "全民国家安全教育日", 4, 15],
  ["china-space-day", "中国航天日", 4, 24],
  ["labor-day", "劳动节", 5, 1],
  ["labor-day-2", "劳动节第二天", 5, 2],
  ["youth-day", "青年节", 5, 4],
  ["nurses-day", "护士节", 5, 12],
  ["china-tourism-day", "中国旅游日", 5, 19],
  ["may-thirtieth-movement-memorial-day", "五卅纪念日", 5, 30],
  ["national-science-workers-day", "全国科技工作者日", 5, 30],
  ["childrens-day", "儿童节", 6, 1],
  ["national-eye-care-day", "全国爱眼日", 6, 6],
  ["national-land-day", "全国土地日", 6, 25],
  ["cpc-founding-day", "建党节", 7, 1],
  ["marco-polo-bridge-incident", "七七事变", 7, 7],
  ["marco-polo-bridge-memorial-day", "七七抗战纪念日", 7, 7],
  ["china-maritime-day", "中国航海日", 7, 11],
  ["korean-war-armistice", "抗美援朝战争胜利纪念日", 7, 27],
  ["army-day", "中国人民解放军建军纪念日", 8, 1],
  ["national-fitness-day", "全民健身日", 8, 8],
  ["japan-surrender-announcement", "日本宣布无条件投降", 8, 15],
  ["national-ecology-day", "全国生态日", 8, 15],
  ["chinese-doctors-day", "中国医师节", 8, 19],
  ["japan-surrender-instrument", "日本签署投降书", 9, 2],
  ["victory-over-japan-day", "中国人民抗日战争胜利纪念日", 9, 3],
  ["teachers-day", "教师节", 9, 10],
  ["mukden-incident", "九一八事变", 9, 18],
  ["mukden-incident-memorial-day", "九一八抗战纪念日", 9, 18],
  ["national-teeth-care-day", "全国爱牙日", 9, 20],
  ["citizen-morality-day", "公民道德宣传日", 9, 20],
  ["martyrs-day", "烈士纪念日", 9, 30],
  ["national-day", "国庆节", 10, 1],
  ["national-day-2", "国庆节第二天", 10, 2],
  ["national-day-3", "国庆节第三天", 10, 3],
  ["1024-day", "ʚ1024ɞ", 10, 24],
  ["resist-us-aid-korea-day", "抗美援朝纪念日", 10, 25],
  ["taiwan-retrocession-day", "台湾光复纪念日", 10, 25],
  ["halloween-eve", "万圣夜", 10, 31],
  ["halloween", "万圣节", 11, 1],
  ["journalists-day", "记者节", 11, 8],
  ["national-fire-safety-day", "全国消防日", 11, 9],
  ["national-traffic-safety-day", "全国交通安全日", 12, 2],
  ["national-legal-publicity-day", "全国法制宣传日", 12, 4],
  ["nanjing-massacre-memorial-day", "南京大屠杀死难者国家公祭日", 12, 13],
  ["macau-handover-day", "澳门回归纪念日", 12, 20],
  ["christmas-eve", "平安夜", 12, 24],
  ["christmas", "圣诞节", 12, 25],
];

const SOLAR_TERMS = [
  ["minor-cold", "小寒", 1, 5.4055],
  ["major-cold", "大寒", 1, 20.12],
  ["start-of-spring", "立春", 2, 3.87],
  ["rain-water", "雨水", 2, 18.73],
  ["awakening-of-insects", "惊蛰", 3, 5.63],
  ["spring-equinox", "春分", 3, 20.646],
  ["clear-and-bright", "清明", 4, 4.81],
  ["grain-rain", "谷雨", 4, 20.1],
  ["start-of-summer", "立夏", 5, 5.52],
  ["grain-full", "小满", 5, 21.04],
  ["grain-in-ear", "芒种", 6, 5.678],
  ["summer-solstice", "夏至", 6, 21.37],
  ["minor-heat", "小暑", 7, 7.108],
  ["major-heat", "大暑", 7, 22.83],
  ["start-of-autumn", "立秋", 8, 7.5],
  ["end-of-heat", "处暑", 8, 23.13],
  ["white-dew", "白露", 9, 7.646],
  ["autumn-equinox", "秋分", 9, 23.042],
  ["cold-dew", "寒露", 10, 8.318],
  ["frost-descent", "霜降", 10, 23.438],
  ["start-of-winter", "立冬", 11, 7.438],
  ["minor-snow", "小雪", 11, 22.36],
  ["major-snow", "大雪", 12, 7.18],
  ["winter-solstice", "冬至", 12, 21.94],
];

// Annual adjusted schedules are official one-year notices, not reusable calendar formulas.
const CHINA_ADJUSTED_HOLIDAY_SCHEDULES = {
  2025: {
    holidays: [
      ["new-year-holiday", "元旦假期", "2025-01-01", "2025-01-01"],
      ["spring-festival-holiday", "春节假期", "2025-01-28", "2025-02-04"],
      ["qingming-holiday", "清明节假期", "2025-04-04", "2025-04-06"],
      ["labor-day-holiday", "劳动节假期", "2025-05-01", "2025-05-05"],
      ["dragon-boat-holiday", "端午节假期", "2025-05-31", "2025-06-02"],
      ["national-mid-autumn-holiday", "国庆节、中秋节假期", "2025-10-01", "2025-10-08"],
    ],
    workdays: [
      ["spring-festival-makeup-workday", "春节调休补班", "2025-01-26"],
      ["spring-festival-makeup-workday", "春节调休补班", "2025-02-08"],
      ["labor-day-makeup-workday", "劳动节调休补班", "2025-04-27"],
      ["national-mid-autumn-makeup-workday", "国庆节、中秋节调休补班", "2025-09-28"],
      ["national-mid-autumn-makeup-workday", "国庆节、中秋节调休补班", "2025-10-11"],
    ],
  },
  2026: {
    holidays: [
      ["new-year-holiday", "元旦假期", "2026-01-01", "2026-01-03"],
      ["spring-festival-holiday", "春节假期", "2026-02-15", "2026-02-23"],
      ["qingming-holiday", "清明节假期", "2026-04-04", "2026-04-06"],
      ["labor-day-holiday", "劳动节假期", "2026-05-01", "2026-05-05"],
      ["dragon-boat-holiday", "端午节假期", "2026-06-19", "2026-06-21"],
      ["mid-autumn-holiday", "中秋节假期", "2026-09-25", "2026-09-27"],
      ["national-day-holiday", "国庆节假期", "2026-10-01", "2026-10-07"],
    ],
    workdays: [
      ["new-year-makeup-workday", "元旦调休补班", "2026-01-04"],
      ["spring-festival-makeup-workday", "春节调休补班", "2026-02-14"],
      ["spring-festival-makeup-workday", "春节调休补班", "2026-02-28"],
      ["labor-day-makeup-workday", "劳动节调休补班", "2026-05-09"],
      ["national-day-makeup-workday", "国庆节调休补班", "2026-09-20"],
      ["national-day-makeup-workday", "国庆节调休补班", "2026-10-10"],
    ],
  },
};

export function generateCalendar({
  now = new Date(),
  pastYears = 1,
  futureYears = 3,
  adjustedSchedules = {},
} = {}) {
  const currentYear = now.getUTCFullYear();
  const years = [];

  for (let year = currentYear - pastYears; year <= currentYear + futureYears; year += 1) {
    years.push(year);
  }

  const generatedAt = toUtcStamp(now);
  const resolvedAdjustedSchedules = resolveAdjustedSchedules(adjustedSchedules);
  const events = years.flatMap((year) => eventsForYear(year, generatedAt, resolvedAdjustedSchedules));
  const lines = [
    "BEGIN:VCALENDAR",
    `PRODID:${PROD_ID}`,
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(CALENDAR_NAME)}`,
    "X-WR-TIMEZONE:Asia/Shanghai",
    `X-WR-CALDESC:${escapeText(CALENDAR_DESCRIPTION)}`,
    `X-APPLE-CALENDAR-COLOR:${COLOR}`,
    ...timeZoneLines(),
    ...events.flatMap(formatEvent),
    "END:VCALENDAR",
  ];

  return foldCalendarLines(lines).join("\r\n") + "\r\n";
}

export function eventsForYear(
  year,
  generatedAt = toUtcStamp(new Date()),
  adjustedSchedules = {},
) {
  const resolvedAdjustedSchedules = resolveAdjustedSchedules(adjustedSchedules);
  const fixed = FIXED_SOLAR_EVENTS.map(([id, summary, month, day]) =>
    makeAllDayEvent({
      id,
      summary,
      date: ymd(year, month, day),
      generatedAt,
    }),
  );

  const weekdayBased = [
    makeAllDayEvent({
      id: "mothers-day",
      summary: "母亲节",
      date: nthWeekdayOfMonth(year, 5, 0, 2),
      generatedAt,
    }),
    makeAllDayEvent({
      id: "national-disability-day",
      summary: "全国助残日",
      date: nthWeekdayOfMonth(year, 5, 0, 3),
      generatedAt,
    }),
    makeAllDayEvent({
      id: "fathers-day",
      summary: "父亲节",
      date: nthWeekdayOfMonth(year, 6, 0, 3),
      generatedAt,
    }),
    makeAllDayEvent({
      id: "cultural-and-natural-heritage-day",
      summary: "文化和自然遗产日",
      date: nthWeekdayOfMonth(year, 6, 6, 2),
      generatedAt,
    }),
    makeAllDayEvent({
      id: "national-defense-education-day",
      summary: "全民国防教育日",
      date: nthWeekdayOfMonth(year, 9, 6, 3),
      generatedAt,
    }),
    makeAllDayEvent({
      id: "school-safety-education-day",
      summary: "全国中小学生安全教育日",
      date: lastWeekdayOfMonth(year, 3, 1),
      generatedAt,
    }),
    makeAllDayEvent({
      id: "thanksgiving",
      summary: "感恩节",
      date: nthWeekdayOfMonth(year, 11, 4, 4),
      generatedAt,
    }),
  ];

  const springFestival = findLunarDateInGregorianYear(year, 1, 1);
  const lunar = [
    ["chinese-new-year-eve", "除夕", addDays(springFestival, -1)],
    ["spring-festival", "春节", springFestival],
    ["spring-festival-2", "春节初二", addDays(springFestival, 1)],
    ["spring-festival-3", "春节初三", addDays(springFestival, 2)],
    ["renri", "人日", findLunarDateInGregorianYear(year, 1, 7)],
    ["lantern-festival", "元宵节", findLunarDateInGregorianYear(year, 1, 15)],
    ["dragon-head-raising-day", "龙抬头", findLunarDateInGregorianYear(year, 2, 2)],
    ["sheri-festival", "社日节", findLunarDateInGregorianYear(year, 2, 2)],
    ["flower-festival", "花朝节", findLunarDateInGregorianYear(year, 2, 2)],
    ["shangsi-festival", "上巳节", findLunarDateInGregorianYear(year, 3, 3)],
    ["dragon-boat-festival", "端午节", findLunarDateInGregorianYear(year, 5, 5)],
    ["qixi-festival", "七夕节", findLunarDateInGregorianYear(year, 7, 7)],
    ["ghost-festival", "中元节", findLunarDateInGregorianYear(year, 7, 15)],
    ["mid-autumn-festival", "中秋节", findLunarDateInGregorianYear(year, 8, 15)],
    ["double-ninth-festival", "重阳节", findLunarDateInGregorianYear(year, 9, 9)],
    ["seniors-day", "老年节", findLunarDateInGregorianYear(year, 9, 9)],
    ["winter-clothes-festival", "寒衣节", findLunarDateInGregorianYear(year, 10, 1)],
    ["xiayuan-festival", "下元节", findLunarDateInGregorianYear(year, 10, 15)],
    ...lunarDatesInGregorianYear(year, 12, 8).map((date) => ["laba-festival", "腊八节", date]),
    ...lunarDatesInGregorianYear(year, 12, 23).map((date) => [
      "north-little-new-year",
      "北小年",
      date,
    ]),
    ...lunarDatesInGregorianYear(year, 12, 24).map((date) => [
      "south-little-new-year",
      "南小年",
      date,
    ]),
  ].map(([id, summary, date]) =>
    makeAllDayEvent({
      id,
      summary,
      date,
      generatedAt,
    }),
  );

  const solarTermBased = [
    makeAllDayEvent({
      id: "cold-food-festival",
      summary: "寒食节",
      date: addDays(qingmingDate(year), -1),
      generatedAt,
    }),
    makeAllDayEvent({
      id: "qingming-festival",
      summary: "清明节",
      date: qingmingDate(year),
      generatedAt,
    }),
    makeAllDayEvent({
      id: "chinese-farmers-harvest-festival",
      summary: "中国农民丰收节",
      date: solarTermDate(year, 9, 23.042),
      generatedAt,
    }),
    ...SOLAR_TERMS.map(([id, summary, month, centuryConstant]) =>
      makeAllDayEvent({
        id,
        summary,
        date: solarTermDate(year, month, centuryConstant),
        generatedAt,
      }),
    ),
  ];
  const adjustedSchedule = adjustedHolidayEventsForYear(year, generatedAt, resolvedAdjustedSchedules);
  const adjustedHolidaySuppressions = adjustedHolidaySuppressionsForYear(
    year,
    resolvedAdjustedSchedules,
  );
  const regularEvents = [
    ...fixed,
    ...weekdayBased,
    ...lunar,
    ...solarTermBased,
  ].filter((event) => !isSuppressedByAdjustedHoliday(event, adjustedHolidaySuppressions));

  return [...regularEvents, ...adjustedSchedule].sort((a, b) => a.date.localeCompare(b.date));
}

export function hasLocalAdjustedHolidaySchedule(year) {
  return Boolean(CHINA_ADJUSTED_HOLIDAY_SCHEDULES[year]);
}

function makeAllDayEvent({ id, summary, date, endDate = addDays(date, 1), generatedAt }) {
  return {
    uid: `${date.replaceAll("-", "")}-${id}@${UID_HOST}`,
    summary,
    date,
    endDate,
    generatedAt,
  };
}

function resolveAdjustedSchedules(adjustedSchedules) {
  return { ...CHINA_ADJUSTED_HOLIDAY_SCHEDULES, ...adjustedSchedules };
}

function formatEvent(event) {
  return [
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${event.generatedAt}`,
    `CREATED:${event.generatedAt}`,
    `LAST-MODIFIED:${event.generatedAt}`,
    "SEQUENCE:0",
    `DTSTART;VALUE=DATE:${compactDate(event.date)}`,
    `DTEND;VALUE=DATE:${compactDate(event.endDate)}`,
    `SUMMARY:${escapeText(event.summary)}`,
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
  ];
}

function timeZoneLines() {
  return [
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Shanghai",
    "X-LIC-LOCATION:Asia/Shanghai",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0800",
    "TZOFFSETTO:+0800",
    "TZNAME:CST",
    "DTSTART:19700101T000000",
    "END:STANDARD",
    "END:VTIMEZONE",
  ];
}

function nthWeekdayOfMonth(year, month, weekday, nth) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const offset = (weekday - first.getUTCDay() + 7) % 7;
  return dateToYmd(new Date(Date.UTC(year, month - 1, 1 + offset + (nth - 1) * 7)));
}

function lastWeekdayOfMonth(year, month, weekday) {
  const last = new Date(Date.UTC(year, month, 0));
  const offset = (last.getUTCDay() - weekday + 7) % 7;
  return dateToYmd(new Date(Date.UTC(year, month - 1, last.getUTCDate() - offset)));
}

function adjustedHolidayEventsForYear(year, generatedAt, adjustedSchedules) {
  const schedule = adjustedSchedules[year];
  if (!schedule) return [];

  const holidayEvents = schedule.holidays.map(([id, summary, startDate, endDate]) =>
    makeAllDayEvent({
      id,
      summary: `${holidayBaseSummary(summary)}${HOLIDAY_SUMMARY_SUFFIX}`,
      date: startDate,
      endDate: addDays(endDate, 1),
      generatedAt,
    }),
  );
  const workdayEvents = schedule.workdays.map(([id, summary, date]) =>
    makeAllDayEvent({
      id,
      summary: WORKDAY_SUMMARY,
      date,
      generatedAt,
    }),
  );

  return [...holidayEvents, ...workdayEvents];
}

function holidayBaseSummary(summary) {
  return summary.replace(/假期$/, "");
}

function adjustedHolidaySuppressionsForYear(year, adjustedSchedules) {
  const schedule = adjustedSchedules[year];
  if (!schedule) return [];

  return schedule.holidays.map(([, summary, startDate, endDate]) => ({
    summaries: holidaySummariesCoveredBy(holidayBaseSummary(summary)),
    startDate,
    endDate,
  }));
}

function holidaySummariesCoveredBy(summary) {
  const bases = summary.split(/[、，,]/).map((base) => base.trim());
  return new Set(bases.flatMap((base) => HOLIDAY_SUMMARIES_BY_BASE[base] ?? [base]));
}

function isSuppressedByAdjustedHoliday(event, suppressions) {
  return suppressions.some(
    ({ summaries, startDate, endDate }) =>
      summaries.has(event.summary) && startDate <= event.date && event.date <= endDate,
  );
}

function findLunarDateInGregorianYear(year, lunarMonth, lunarDay) {
  const [date] = lunarDatesInGregorianYear(year, lunarMonth, lunarDay);
  if (date) return date;

  throw new Error(`Lunar date ${lunarMonth}-${lunarDay} not found in ${year}`);
}

function lunarDatesInGregorianYear(year, lunarMonth, lunarDay) {
  const dates = [];

  for (let month = 1; month <= 12; month += 1) {
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = ymd(year, month, day);
      const lunarDate = lunarParts(date);
      if (lunarDate.month === lunarMonth && lunarDate.day === lunarDay) {
        dates.push(date);
      }
    }
  }

  return dates;
}

function lunarParts(date) {
  const parts = CHINESE_CALENDAR.formatToParts(new Date(`${date}T00:00:00Z`));
  return {
    month: Number(parts.find((part) => part.type === "month").value),
    day: Number(parts.find((part) => part.type === "day").value),
  };
}

function qingmingDate(year) {
  return solarTermDate(year, 4, 4.81);
}

function solarTermDate(year, month, centuryConstant) {
  const lastTwoDigits = year % 100;
  const day =
    Math.floor(lastTwoDigits * 0.2422 + centuryConstant) - Math.floor((lastTwoDigits - 1) / 4);
  return ymd(year, month, day);
}

function ymd(year, month, day) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function addDays(date, days) {
  const [year, month, day] = date.split("-").map(Number);
  return dateToYmd(new Date(Date.UTC(year, month - 1, day + days)));
}

function dateToYmd(date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function compactDate(date) {
  return date.replaceAll("-", "");
}

function toUtcStamp(date) {
  return date.toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}Z$/, "Z");
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function escapeText(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("\n", "\\n").replaceAll(",", "\\,").replaceAll(";", "\\;");
}

function foldCalendarLines(lines) {
  return lines.flatMap((line) => {
    if (line.length <= 74) return [line];

    const chunks = [];
    let rest = line;
    while (rest.length > 74) {
      chunks.push(rest.slice(0, 74));
      rest = ` ${rest.slice(74)}`;
    }
    chunks.push(rest);
    return chunks;
  });
}
