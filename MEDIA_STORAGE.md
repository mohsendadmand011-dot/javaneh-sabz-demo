# Media storage

Local mode writes random, extension-controlled filenames to
`MEDIA_STORAGE_PATH` and serves them through `/media/{storageKey}` with the
recorded MIME type, `nosniff`, inline disposition and immutable caching.

Allowed formats: JPEG/JPG, PNG, WEBP, GIF, MP4 and WEBM. Validation checks the
declared MIME type, filename extension, file signature and configured maximum
size on the server. SVG, HTML, scripts and executable formats are rejected.

The database stores original/stored names, MIME/file type, byte size, image
dimensions where detectable, public URL, alt text, caption, timestamps and the
uploading user. Deletion is blocked while referenced by products, articles,
events or homepage settings. Replacement updates relational URLs atomically and
removes the old file only after the database transaction succeeds.

For Docker, mount `/app/data/uploads`. For a VPS, use a path outside the release
directory, such as `/srv/javaneh/media`. Back up the PostgreSQL database and
media directory together. `MediaStorageProvider` is the stable interface for a
future S3-compatible, Cloudflare R2 or MinIO implementation.
