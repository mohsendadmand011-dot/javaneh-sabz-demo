import { prisma } from "../../lib/prisma";

export async function GET() {
  const rows = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
    },
    include: {
      category: true,
      coverMedia: true,
      media: { include: { media: true }, orderBy: { order: "asc" } },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
  return Response.json({
    articles: rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      content: row.content,
      category: row.category?.name || "آموزش",
      image: row.coverMedia?.url || row.cover || "#dce4d6",
      date: (row.publishedAt || row.createdAt).toISOString(),
      seoTitle: row.seoTitle,
      metaDescription: row.metaDescription,
      media: row.media.map((relation) => ({
        ...relation.media,
        caption: relation.caption || relation.media.caption,
      })),
    })),
  });
}
