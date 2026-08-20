/* eslint-disable @typescript-eslint/no-explicit-any */
import { PublishStatus, Role } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { sanitizeRichText } from "../../../lib/sanitize";

const types = z.enum(["articles", "events", "representatives"]);

export async function GET(request: Request) {
  const auth = await requireRole(request, [Role.ADMIN, Role.EDITOR]);
  if ("error" in auth) return auth.error;
  const type = types.safeParse(new URL(request.url).searchParams.get("type"));
  if (!type.success)
    return Response.json({ error: "نوع محتوا نامعتبر است" }, { status: 400 });
  if (type.data === "articles")
    return Response.json({
      records: await prisma.article.findMany({
        include: {
          coverMedia: true,
          media: { include: { media: true }, orderBy: { order: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      }),
    });
  if (type.data === "events")
    return Response.json({
      records: await prisma.event.findMany({
        include: { coverMedia: true },
        orderBy: { startsAt: "desc" },
      }),
    });
  return Response.json({
    records: await prisma.representative.findMany({
      orderBy: [{ province: "asc" }, { city: "asc" }],
    }),
  });
}

export async function POST(request: Request) {
  const auth = await requireRole(request, [Role.ADMIN, Role.EDITOR]);
  if ("error" in auth) return auth.error;
  const body: any = await request.json().catch(() => null);
  const type = types.safeParse(body?.type);
  if (!type.success)
    return Response.json({ error: "نوع محتوا نامعتبر است" }, { status: 400 });
  if (type.data === "articles") {
    const input = z
      .object({
        title: z.string().min(2).max(200),
        slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        excerpt: z.string().min(5).max(500),
        content: z.string().min(5).max(100000),
        coverMediaId: z.string().nullable().optional(),
        mediaIds: z.array(z.string()).max(50).optional().default([]),
        seoTitle: z.string().max(160).nullable().optional(),
        metaDescription: z.string().max(320).nullable().optional(),
        status: z.nativeEnum(PublishStatus).default(PublishStatus.DRAFT),
      })
      .safeParse(body);
    if (!input.success)
      return Response.json(
        { error: "اطلاعات مقاله نامعتبر است" },
        { status: 400 },
      );
    const { mediaIds, ...articleData } = input.data;
    return Response.json(
      {
        record: await prisma.article.create({
          data: {
            ...articleData,
            content: sanitizeRichText(input.data.content),
            cover: input.data.coverMediaId
              ? (
                  await prisma.media.findUnique({
                    where: { id: input.data.coverMediaId },
                  })
                )?.url
              : null,
            media: {
              create: mediaIds.map((mediaId, order) => ({ mediaId, order })),
            },
            authorId: auth.user.id,
            publishedAt: input.data.status === "PUBLISHED" ? new Date() : null,
          },
        }),
      },
      { status: 201 },
    );
  }
  if (type.data === "events") {
    const input = z
      .object({
        title: z.string().min(2).max(200),
        description: z.string().min(5).max(5000),
        startsAt: z.coerce.date(),
        location: z.string().min(2).max(300),
        status: z.nativeEnum(PublishStatus).default(PublishStatus.DRAFT),
        coverMediaId: z.string().nullable().optional(),
      })
      .safeParse(body);
    if (!input.success)
      return Response.json(
        { error: "اطلاعات رویداد نامعتبر است" },
        { status: 400 },
      );
    return Response.json(
      {
        record: await prisma.event.create({
          data: {
            ...input.data,
            cover: input.data.coverMediaId
              ? (
                  await prisma.media.findUnique({
                    where: { id: input.data.coverMediaId },
                  })
                )?.url
              : null,
          },
        }),
      },
      { status: 201 },
    );
  }
  const input = z
    .object({
      name: z.string().min(2).max(160),
      province: z.string().min(2).max(100),
      city: z.string().min(2).max(100),
      mobile: z.string().max(30).nullable().optional(),
      address: z.string().min(5).max(1000),
      status: z.nativeEnum(PublishStatus).default(PublishStatus.PUBLISHED),
    })
    .safeParse(body);
  if (!input.success)
    return Response.json(
      { error: "اطلاعات نمایندگی نامعتبر است" },
      { status: 400 },
    );
  return Response.json(
    {
      record: await prisma.representative.create({
        data: { ...input.data, mobile: input.data.mobile ?? "" },
      }),
    },
    { status: 201 },
  );
}
