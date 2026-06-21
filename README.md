# Daymark

Daymark is the product site and Apple Calendar subscription service for Chinese
holiday, solar-term, and adjusted workday reminders.

## Architecture

- `packages/calendar` exposes `@daymark/calendar`, the shared iCalendar generator.
- `apps/docs/index.html` is the public product homepage source.
- `apps/docs/scripts/build.mjs` renders that HTML and a preview `.ics` file into `apps/docs/dist`.
- `apps/worker` serves the live `.ics` subscription endpoint.
- Event `UID` values are stable across releases to avoid duplicate events.
- Calendar responses include content type, validators, and cache headers.

The source repo stays private. The public product surface is:

```text
https://daymark.agentclub.dev/
https://daymark.agentclub.dev/calendar/daymark.ics
```

## Local Checks

```sh
pnpm install
pnpm test
pnpm build
```

Generated artifacts are written under each app, for example `apps/docs/dist`.

## Product Surface

Daymark is provided at:

```text
https://daymark.agentclub.dev/
https://daymark.agentclub.dev/calendar/daymark.ics
```

The homepage presents Daymark as a product page for Chinese holiday, solar-term,
and adjusted workday subscriptions. It includes one-click copying for the live
subscription URL:

```text
https://daymark.agentclub.dev/calendar/daymark.ics
```

## Service Protection

The live calendar endpoint uses two protections:

- Edge caching for the `.ics` response. Repeated requests can be served from
  cache, and conditional requests with a matching `ETag` return `304`.
- Rate limiting with `CALENDAR_RATE_LIMITER`, configured at 60 requests per 10
  seconds per `cf-connecting-ip`.

The production WAF rule targets the public subscription path:

```text
Expression:
(http.host eq "daymark.agentclub.dev" and http.request.uri.path eq "/calendar/daymark.ics")

Suggested action:
Managed Challenge or Block

Suggested threshold:
60 requests per 10 seconds per IP
```

## Data Credits

Daymark prefers reviewed local holiday schedules when available. For future years
that are not yet maintained locally, the service can supplement adjusted holiday
data from the `timor.tech` holiday API at `https://timor.tech/api/holiday/year`.

## Notes

This version covers deterministic festival reminders, solar terms, and reviewed
adjusted holiday schedules. Future public holiday schedules can be added locally
or fetched by the service when the official year data is available.
