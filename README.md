# Daymark

Apple Calendar subscription endpoint for holiday and reminder calendars.

## Architecture

- `packages/calendar` exposes `@daymark/calendar`, the shared calendar generator.
- `apps/worker` contains the Cloudflare Worker that returns the `.ics` subscription endpoint.
- `apps/docs` builds the static documentation site and a preview `.ics` file.
- Event `UID` values are stable across deployments to avoid duplicate events.
- Worker responses include calendar content type, validators, and cache headers.

The source repo stays private; the public surface is the subscription URL and, optionally, the docs site.

## Local Checks

```sh
pnpm install
pnpm test
pnpm build
```

Build outputs are written under each app, for example `apps/docs/dist`.

## Deploy

```sh
pnpm run deploy
```

The Worker path is:

```text
/calendar/daymark.ics
```

## Cloudflare Build Settings

This repo now has two deployable Cloudflare surfaces:

- Worker project: serves the live calendar subscription endpoint.
- Pages project: serves the documentation site built from `apps/docs`.

For the Worker Git deployment, use:

```text
Root directory:
<repository root>

Build command:
pnpm build

Deploy command:
pnpm run deploy
```

For the Pages documentation site, use:

```text
Root directory:
<repository root>

Build command:
pnpm --filter @daymark/docs build

Build output directory:
apps/docs/dist
```

Set this Pages environment variable after choosing the real calendar hostname:

```text
DAYMARK_CALENDAR_ORIGIN=https://calendar.example.com
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

`workers_dev = false` is enabled so the `*.workers.dev` fallback does not stay public. Before deploying, replace and uncomment the Custom Domain route in `apps/worker/wrangler.toml`.

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
