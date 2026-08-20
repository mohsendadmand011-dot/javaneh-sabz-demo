# Production deployment

## Node.js deployment

1. Provision Node.js 22.13+, PostgreSQL 16+, and an HTTPS reverse proxy.
2. Copy `FINAL_DEPLOYMENT_V2` to the server.
3. Create `.env` from `.env.example` with unique secrets and the public HTTPS URL.
4. Create the directory in `MEDIA_STORAGE_PATH`; grant it only to the app user.
5. Run `npm ci`, `npm run prisma:generate`, `npm run db:migrate`, and `npm run build`.
6. Seed only a new empty database with `npm run db:seed`.
7. Run `npm run start -- --port 3100 --hostname 127.0.0.1` under systemd/PM2.
8. Proxy the public domain to `127.0.0.1:3100` and enable HTTPS/HSTS at the proxy.
9. Verify `/api/health`, `/`, a product page, media retrieval, and `/admin` authentication.

## Docker Compose

Set `POSTGRES_PASSWORD`, `AUTH_SECRET`, and `NEXT_PUBLIC_APP_URL` in `.env`, then
run `docker compose build` and `docker compose up -d`. PostgreSQL is not
published to the host. The app binds host loopback port 3100 for a reverse
proxy. Named volumes `postgres_data` and `app_media` persist database and media.
The container applies pending migrations before starting.

## Reverse proxy and HTTPS

Expose only ports 80/443. Proxy to the application HTTP port. Do not expose
PostgreSQL, development tools, the filesystem, or Prisma Studio. Set reasonable
request-body/time limits above the configured video maximum, and preserve
streaming responses and `X-Forwarded-*` headers.

## Backup, restore and updates

Back up PostgreSQL with `pg_dump --format=custom` and archive the media directory
at the same release point. Encrypt backups and test restoration regularly. To
update: take a backup, install the new package, run `npm ci`, generate Prisma,
apply migrations, build, restart, then run health and smoke checks. Roll back
application code only with a database-compatible version; restore the database
only during an approved recovery procedure.
