import { prisma } from "../../lib/prisma";
import { readStoredMedia } from "../../lib/storage";

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string }> },
) {
  const { key } = await context.params;
  const media = await prisma.media.findUnique({ where: { storageKey: key } });
  if (!media) return new Response("Not found", { status: 404 });
  try {
    const { bytes } = await readStoredMedia(key);
    return new Response(bytes, {
      headers: {
        "content-type": media.mimeType,
        "content-length": String(bytes.byteLength),
        "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(media.originalFilename)}`,
        "x-content-type-options": "nosniff",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
