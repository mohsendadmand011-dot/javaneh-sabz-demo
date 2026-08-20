import { Role } from "@prisma/client";
import { requireRole } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import {
  safeOriginalFilename,
  storageProvider,
  type StoredMedia,
} from "../../../lib/storage";

async function references(id: string, url: string) {
  const [
    productImages,
    productVideos,
    articleCovers,
    articleMedia,
    eventCovers,
    settings,
  ] = await Promise.all([
    prisma.productImage.count({ where: { mediaId: id } }),
    prisma.productVideo.count({ where: { mediaId: id } }),
    prisma.article.count({ where: { coverMediaId: id } }),
    prisma.articleMedia.count({ where: { mediaId: id } }),
    prisma.event.count({ where: { coverMediaId: id } }),
    prisma.siteSetting.findMany({ select: { key: true, value: true } }),
  ]);
  const siteSettings = settings
    .filter(
      (row) =>
        JSON.stringify(row.value).includes(id) ||
        JSON.stringify(row.value).includes(url),
    )
    .map((row) => row.key);
  return {
    productImages,
    productVideos,
    articleCovers,
    articleMedia,
    eventCovers,
    siteSettings,
  };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(request, [Role.ADMIN, Role.EDITOR]);
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const media = await prisma.media.findUnique({ where: { id } });
  return media
    ? Response.json({ media, references: await references(id, media.url) })
    : Response.json({ error: "رسانه پیدا نشد." }, { status: 404 });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(request, [Role.ADMIN, Role.EDITOR]);
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const current = await prisma.media.findUnique({ where: { id } });
  if (!current)
    return Response.json({ error: "رسانه پیدا نشد." }, { status: 404 });
  const form = await request.formData();
  const file = form.get("file");
  const alt =
    String(form.get("alt") ?? current.alt ?? "")
      .trim()
      .slice(0, 300) || null;
  const caption =
    String(form.get("caption") ?? current.caption ?? "")
      .trim()
      .slice(0, 1000) || null;
  if (!(file instanceof File) || !file.size) {
    return Response.json({
      media: await prisma.media.update({
        where: { id },
        data: { alt, caption },
      }),
    });
  }
  const provider = storageProvider();
  let stored: StoredMedia | undefined;
  try {
    stored = await provider.put(file);
    const replacement = stored;
    const media = await prisma.$transaction(async (tx) => {
      const updated = await tx.media.update({
        where: { id },
        data: {
          name: safeOriginalFilename(file.name),
          originalFilename: safeOriginalFilename(file.name),
          alt,
          caption,
          ...replacement,
        },
      });
      await tx.productImage.updateMany({
        where: { mediaId: id },
        data: { url: replacement.url },
      });
      await tx.article.updateMany({
        where: { coverMediaId: id },
        data: { cover: replacement.url },
      });
      await tx.event.updateMany({
        where: { coverMediaId: id },
        data: { cover: replacement.url },
      });
      return updated;
    });
    await provider.remove(current.storageKey);
    return Response.json({ media });
  } catch (error) {
    if (stored) await provider.remove(stored.storageKey).catch(() => undefined);
    console.error("Media replacement failed", error);
    return Response.json(
      {
        error: "جایگزینی رسانه ناموفق بود.",
        code: error instanceof Error ? error.message : "REPLACE_FAILED",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(request, [Role.ADMIN]);
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media)
    return Response.json({ error: "رسانه پیدا نشد." }, { status: 404 });
  const usedBy = await references(id, media.url);
  if (
    Object.values(usedBy).some((value) =>
      Array.isArray(value) ? value.length > 0 : value > 0,
    )
  )
    return Response.json(
      {
        error: "این رسانه در محتوا استفاده شده و قابل حذف نیست.",
        references: usedBy,
      },
      { status: 409 },
    );
  await prisma.media.delete({ where: { id } });
  try {
    await storageProvider().remove(media.storageKey);
  } catch (error) {
    console.error("Media file cleanup failed", error);
  }
  return Response.json({ ok: true });
}
