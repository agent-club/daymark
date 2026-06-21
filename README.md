# Daymark on Cloudflare

Apple Calendar subscription endpoint for holiday and reminder calendars.

## Architecture

- Cloudflare Worker returns a deterministic `.ics` file.
- The calendar is generated from a rolling year window.
- Event `UID` values are stable across deployments to avoid duplicate events.
- Responses include calendar content type, validators, and cache headers.
- The source repo stays private; the public surface is only the subscription URL.

For very high traffic, the same generator can emit a static file with `npm run build`, then serve `dist/calendar/daymark.ics` from Cloudflare Pages or R2.

## Local Checks

```sh
npm install
npm test
npm run build
```

## Deploy

```sh
npx wrangler deploy
```

The Worker path is:

```text
/calendar/daymark.ics
```

## Custom Domain

This Worker is the origin for the calendar endpoint, so Cloudflare Custom Domains are the preferred setup.

In Cloudflare:

1. Add the domain to Cloudflare and make sure the zone is active.
2. Go to Workers & Pages > daymark > Settings > Domains & Routes.
3. Add a Custom Domain, for example `calendar.example.com`.
4. Subscribe to:

```text
https://calendar.example.com/calendar/daymark.ics
```

The same can be managed from `wrangler.toml` after choosing the real hostname:

```toml
[[routes]]
pattern = "calendar.example.com"
custom_domain = true
```

`workers_dev = false` is enabled so the `*.workers.dev` fallback does not stay public. Before deploying, replace and uncomment the Custom Domain route in `wrangler.toml`.

## Abuse Protection

The Worker uses two protections for `/calendar/daymark.ics`:

- Cloudflare Cache API for the `.ics` response. Repeated requests can be served from edge cache, and conditional requests with a matching `ETag` return `304`.
- Cloudflare Workers Rate Limiting binding named `CALENDAR_RATE_LIMITER`, configured at 60 requests per 10 seconds per `cf-connecting-ip`.

For stronger edge protection, also add a Cloudflare WAF rate limiting rule for the custom hostname:

```text
Expression:
(http.host eq "calendar.example.com" and http.request.uri.path eq "/calendar/daymark.ics")

Suggested action:
Managed Challenge or Block

Suggested threshold:
60 requests per 10 seconds per IP
```

For a private or small-audience calendar, prefer a less discoverable path and only share that subscription URL.

## Notes

This first version covers deterministic festival reminders. Official public holidays, makeup workdays, and lunar-calendar events should be added from reviewed source data before publishing those categories.
