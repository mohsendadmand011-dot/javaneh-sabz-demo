# Javaneh Sabz

Persian RTL ecommerce and content-management application built with React 19,
TypeScript, Vinext, PostgreSQL and Prisma.

## Requirements

- Windows 10/11 or a Node-capable Linux server
- Node.js 22.13 or newer
- PostgreSQL 16 or newer (a project-local PostgreSQL 18 runtime is bundled for Windows preview)
- Approximately 2 GB free disk space plus uploaded media

## Local installation

1. Run `npm.cmd ci`.
2. Copy `.env.example` to `.env` and replace every placeholder.
3. Run `npm.cmd run prisma:generate`.
4. Run `npm.cmd run db:migrate`.
5. For a new empty database only, run `npm.cmd run db:seed`.
6. Run `npm.cmd run build`.
7. Double-click `START_LOCAL_PRODUCTION.cmd`, or run `npm.cmd run preview:production`.

Website: `http://127.0.0.1:3100`  
Admin: `http://127.0.0.1:3100/admin`  
Health: `http://127.0.0.1:3100/api/health`

## Development

Start PostgreSQL with `npm.cmd run db:local`, then run `npm.cmd run dev`.
Validate changes with `npm.cmd run typecheck`, `npm.cmd run lint`, and
`npm.cmd test`.

## Database and administrator

`DATABASE_URL` selects PostgreSQL. Migrations are additive and must be applied
with `npm run db:migrate`; never use reset against production. The seed creates
the initial administrator from `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, and
`SEED_ADMIN_NAME`. To set or change the administrator password, stop the site,
set `SEED_ADMIN_EMAIL` to the existing administrator email and
`SEED_ADMIN_PASSWORD` to the new strong password in `.env`, run
`npm.cmd run db:seed`, then restart with `START_LOCAL_PRODUCTION.cmd`. Rotate
that password before publishing the site. See
`DATABASE.md` for backup and restore instructions.

## Quality assurance

The development-only QA lab covers route contracts, customer authentication,
RBAC, desktop/mobile interactions, console/server errors, screenshot regression,
and controlled restart persistence. See `QA.md` and
`REFERENCE_DESIGN_CHECKLIST.md`. Run `npm.cmd run qa:full` while the production
preview is healthy; use the documented three-step persistence workflow when a
database/application restart is being verified.

## Media storage

The CMS accepts validated JPEG, PNG, WEBP, GIF, MP4 and WEBM files. Set
`MEDIA_STORAGE_PROVIDER=local`, `MEDIA_STORAGE_PATH` to a persistent directory,
and `MEDIA_PUBLIC_URL=/media`. Image/video size limits are controlled by
`MAX_IMAGE_UPLOAD_MB` and `MAX_VIDEO_UPLOAD_MB`. Uploaded binaries are stored on
disk; PostgreSQL stores their metadata and relationships. Back up both. The
provider interface in `app/lib/storage.ts` is the extension point for S3, R2 or
MinIO. See `MEDIA_STORAGE.md`.

## CMS and themes

ADMIN and EDITOR users can manage products, galleries, videos, articles,
events, homepage media/content, categories and predefined themes. ADMIN alone
can delete media and change user roles. Theme selection is stored in PostgreSQL,
not browser storage.

## Production deployment

Follow `DEPLOYMENT.md` and `DEPLOYMENT_CHECKLIST.md`. PostgreSQL must remain on a
private network, HTTPS must terminate at a reverse proxy, and the media path
must be mounted persistently. Never commit `.env` or copy the local database
directory into a deployment package.

## Troubleshooting

- If PowerShell blocks `npm.ps1`, use `npm.cmd`.
- If port 3100 or 55432 is occupied, run `STOP_LOCAL_PRODUCTION.cmd` only when
  you intend to stop this project's local services.
- If health reports a database error, verify `DATABASE_URL`, PostgreSQL, and
  pending migrations.
- Upload errors include a machine-readable validation code; verify signature,
  extension, MIME type, size limits and write permission on the media path.
- A media deletion returning HTTP 409 means the item is referenced; replace or
  detach it from the relevant product/content first.
