# Deployment checklist

- [ ] `.env` contains no placeholders and is not committed
- [ ] Strong database password and 32+ byte random `AUTH_SECRET`
- [ ] Public HTTPS URL configured; initial admin password rotated
- [ ] PostgreSQL is private and backed up
- [ ] Persistent media directory/volume exists and is backed up
- [ ] `npm ci`, Prisma generation, migrations, type-check, lint, tests and build pass
- [ ] Reverse proxy exposes only HTTPS application traffic
- [ ] Health, homepage, product, article and media URLs return successfully
- [ ] Anonymous/customer admin mutations return 401/403
- [ ] Administrator login, upload, replacement and deletion safety verified
- [ ] Restore procedure tested and update rollback plan recorded
