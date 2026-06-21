import { mkdir, writeFile } from "node:fs/promises";
import { generateCalendar } from "@daymark/calendar";

const calendarPath = "/calendar/daymark.ics";
const calendarOrigin = process.env.DAYMARK_CALENDAR_ORIGIN || "https://calendar.example.com";
const calendarUrl = `${calendarOrigin}${calendarPath}`;
const generatedAt = new Date();
const ics = generateCalendar({ now: generatedAt });
const eventCount = ics.match(/^BEGIN:VEVENT\r$/gm)?.length ?? 0;

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
await writeFile("dist/index.html", html({ calendarUrl, eventCount, generatedAt }), "utf8");

console.log("Generated apps/docs/dist");

function html({ calendarUrl, eventCount, generatedAt }) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Daymark</title>
    <style>
      :root {
        color-scheme: light;
        --ink: #172033;
        --muted: #667085;
        --line: #d7dee8;
        --paper: #fbfcfe;
        --panel: #ffffff;
        --accent: #d97706;
        --green: #0f8b6f;
        --blue: #2d6cdf;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: var(--ink);
        background: var(--paper);
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.6;
      }
      main { max-width: 1120px; margin: 0 auto; padding: 48px 24px 64px; }
      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(320px, 440px);
        gap: 40px;
        align-items: center;
        min-height: min(720px, 88vh);
      }
      h1 { margin: 0; font-size: clamp(48px, 9vw, 112px); line-height: .86; letter-spacing: 0; }
      h2 { margin: 0 0 12px; font-size: 24px; letter-spacing: 0; }
      p { margin: 0; color: var(--muted); }
      .lead { max-width: 640px; margin-top: 24px; font-size: 20px; }
      .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }
      a.button {
        display: inline-flex;
        align-items: center;
        min-height: 44px;
        padding: 0 18px;
        border: 1px solid var(--line);
        border-radius: 8px;
        color: var(--ink);
        text-decoration: none;
        font-weight: 650;
        background: var(--panel);
      }
      a.button.primary { color: white; border-color: var(--accent); background: var(--accent); }
      .preview {
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--panel);
        box-shadow: 0 18px 48px rgba(23, 32, 51, .08);
        overflow: hidden;
      }
      .preview-head {
        display: flex;
        justify-content: space-between;
        padding: 18px;
        border-bottom: 1px solid var(--line);
        font-weight: 700;
      }
      .month {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
        background: var(--line);
      }
      .day {
        min-height: 58px;
        padding: 8px;
        background: white;
        font-size: 13px;
      }
      .day strong { display: block; color: var(--ink); }
      .day span { display: block; margin-top: 6px; color: var(--muted); font-size: 11px; line-height: 1.25; }
      .day.mark { background: #fff7ed; }
      .day.term { background: #eff6ff; }
      .day.rest { background: #ecfdf5; }
      .sections {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 20px;
        margin-top: 56px;
      }
      section {
        padding-top: 20px;
        border-top: 1px solid var(--line);
      }
      code {
        display: inline-block;
        max-width: 100%;
        padding: 2px 6px;
        border: 1px solid var(--line);
        border-radius: 6px;
        overflow-wrap: anywhere;
        background: white;
        color: var(--ink);
      }
      @media (max-width: 820px) {
        main { padding: 28px 18px 48px; }
        .hero { grid-template-columns: 1fr; gap: 28px; min-height: auto; }
        .sections { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <main>
      <div class="hero">
        <div>
          <h1>Daymark</h1>
          <p class="lead">中国节日、纪念日、节气和休班提醒的日历订阅源。Worker 提供稳定的 <code>.ics</code> 地址，文档站负责说明和预览。</p>
          <div class="actions">
            <a class="button primary" href="${calendarPath}">下载日历</a>
            <a class="button" href="${calendarUrl}">订阅地址</a>
          </div>
        </div>
        <div class="preview" aria-label="Daymark calendar preview">
          <div class="preview-head"><span>2026 六月</span><span>${eventCount} events</span></div>
          <div class="month">
            <div class="day"><strong>1</strong><span>儿童节</span></div>
            <div class="day"><strong>2</strong></div>
            <div class="day"><strong>3</strong></div>
            <div class="day"><strong>4</strong></div>
            <div class="day term"><strong>5</strong><span>芒种</span></div>
            <div class="day mark"><strong>6</strong><span>全国爱眼日</span></div>
            <div class="day"><strong>7</strong></div>
            <div class="day"><strong>8</strong></div>
            <div class="day"><strong>9</strong></div>
            <div class="day"><strong>10</strong></div>
            <div class="day"><strong>11</strong></div>
            <div class="day"><strong>12</strong></div>
            <div class="day mark"><strong>13</strong><span>文化和自然遗产日</span></div>
            <div class="day"><strong>14</strong></div>
            <div class="day"><strong>15</strong></div>
            <div class="day"><strong>16</strong></div>
            <div class="day"><strong>17</strong></div>
            <div class="day"><strong>18</strong></div>
            <div class="day rest"><strong>19</strong><span>端午节（休）</span></div>
            <div class="day rest"><strong>20</strong><span>端午节（休）</span></div>
            <div class="day rest term"><strong>21</strong><span>父亲节 · 夏至</span></div>
          </div>
        </div>
      </div>

      <div class="sections">
        <section>
          <h2>订阅</h2>
          <p>部署后把 <code>calendar.example.com</code> 替换为你的真实域名，在 Apple Calendar 中添加订阅即可。</p>
        </section>
        <section>
          <h2>架构</h2>
          <p><code>@daymark/calendar</code> 生成日历，<code>@daymark/worker</code> 提供 Cloudflare 接口，<code>@daymark/docs</code> 生成文档站。</p>
        </section>
        <section>
          <h2>构建</h2>
          <p>页面由 pnpm workspace 统一构建。本次生成时间：${generatedAt.toISOString()}。</p>
        </section>
      </div>
    </main>
  </body>
</html>
`;
}
