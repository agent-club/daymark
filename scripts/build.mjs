import { mkdir, writeFile } from "node:fs/promises";
import { generateCalendar } from "../src/calendar.js";

const ics = generateCalendar({ now: new Date() });

await mkdir("dist/calendar", { recursive: true });
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
  '<!doctype html><meta charset="utf-8"><title>Daymark</title><a href="/calendar/daymark.ics">Subscribe</a>\n',
  "utf8",
);

console.log("Generated dist/calendar/daymark.ics");
