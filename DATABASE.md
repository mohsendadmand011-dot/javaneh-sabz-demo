# Database operations

PostgreSQL is required in every environment. Set `DATABASE_URL`, run
`npm run prisma:generate`, then `npm run db:migrate`. Run `npm run db:seed` only
for a new database. Production resets and schema pushes are prohibited.

Example backup:

`pg_dump --format=custom --file=javaneh.dump "$DATABASE_URL"`

Example restore into an empty database:

`pg_restore --clean --if-exists --no-owner --dbname="$DATABASE_URL" javaneh.dump`

Restrict network access to the application host/network, use a dedicated role,
rotate credentials, enable encrypted connections where supported, monitor disk
space, and test both database and media restoration.
