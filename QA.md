# Internal QA lab

The QA lab is development-only and is not exposed by the website.

## Commands

- `npm run qa:routes` — fast HTTP route/authentication contract checks.
- `npm run qa:auth` — disposable customer registration, session, address, logout, and invalid-password checks.
- `npm run qa:e2e` — desktop and mobile interaction plus visual regression tests.
- `npm run qa:e2e:update` — create or intentionally approve screenshot baselines.
- `npm run qa:full` — typecheck, lint, unit/build tests, route checks, and browser tests.

For a controlled restart persistence test, run `npm run qa:persistence:create`, stop and restart the application and database, run `npm run qa:persistence:verify`, then run `npm run qa:persistence:cleanup`. The script creates uniquely named disposable product/media records and deletes only those exact records during cleanup.

Start the production preview first with `START_LOCAL_PRODUCTION.cmd`. Browser tests use installed Edge on Windows by default. Set `QA_BROWSER_EXECUTABLE` when another Chromium executable is required.

Screenshot baselines live beside `tests/e2e/site.spec.ts` in its snapshot directory. Test results, traces, and failure screenshots are written under `tests/.results` and `tests/.report`; these generated folders are not deployment artifacts.

The browser suite fails on uncaught page errors, console errors, repeated server errors, blank pages, broken RTL, unexpected authentication behavior, or screenshots exceeding a 2.5% pixel difference.
