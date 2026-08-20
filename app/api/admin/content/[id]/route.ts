/* eslint-disable @typescript-eslint/no-explicit-any */
import { Role } from "@prisma/client";
import { requireRole } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { sanitizeRichText } from "../../../../lib/sanitize";

const allowed = new Set(["articles", "events", "representatives"]);
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(request, [Role.ADMIN, Role.EDITOR]);
  if ("error" in auth) return auth.error;
  const body: any = await request.json().catch(() => null);
  if (!allowed.has(body?.type))
    return Response.json({ error: "نوع محتوا نامعتبر است" }, { status: 400 });
  const { id } = await context.params;
  const data = { ...body };
  delete data.type;
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  delete data.authorId;
  delete data.author;
  delete data.coverMedia;
  delete data.media;
  const mediaIds = Array.isArray(data.mediaIds)
    ? data.mediaIds.filter((value: unknown) => typeof value === "string")
    : undefined;
  delete data.mediaIds;
  if (typeof data.content === "string")
    data.content = sanitizeRichText(data.content);
  if (data.coverMediaId) {
    const coverMedia = await prisma.media.findUnique({
      where: { id: data.coverMediaId },
    });
    if (!coverMedia || coverMedia.fileType !== "IMAGE")
      return Response.json(
        { error: "تصویر شاخص معتبر نیست." },
        { status: 400 },
      );
    data.cover = coverMedia.url;
  } else if (data.coverMediaId === null) data.cover = null;
  if (data.startsAt) data.startsAt = new Date(data.startsAt);
  if (data.publishedAt) data.publishedAt = new Date(data.publishedAt);
  const record =
    body.type === "articles"
      ? await prisma.$transaction(async (tx) => {
          const record = await tx.article.update({ where: { id }, data });
          if (mediaIds) {
            await tx.articleMedia.deleteMany({ where: { articleId: id } });
            if (mediaIds.length)
              await tx.articleMedia.createMany({
                data: mediaIds.map((mediaId: string, order: number) => ({
                  articleId: id,
                  mediaId,
                  order,
                })),
              });
          }
          return record;
        })
      : body.type === "events"
        ? await prisma.event.update({ where: { id }, data })
        : await prisma.representative.update({ where: { id }, data });
  return Response.json({ record });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(request, [Role.ADMIN, Role.EDITOR]);
  if ("error" in auth) return auth.error;
  const type = new URL(request.url).searchParams.get("type");
  if (!allowed.has(type || ""))
    return Response.json({ error: "نوع محتوا نامعتبر است" }, { status: 400 });
  const { id } = await context.params;
  if (type === "articles")
    await prisma.article.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
  else if (type === "events")
    await prisma.event.update({ where: { id }, data: { status: "ARCHIVED" } });
  else
    await prisma.representative.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
  return Response.json({ ok: true });
}
