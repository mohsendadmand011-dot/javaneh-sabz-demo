import type { Prisma } from "@prisma/client";

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: true;
    videos: { include: { media: true } };
  };
}>;

export function publicProduct(product: ProductWithRelations) {
  const primary = [...product.images].sort(
    (a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.order - b.order,
  )[0];
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    category: product.category.name,
    categorySlug: product.category.slug,
    categoryId: product.categoryId,
    price: Number(product.price ?? 0),
    oldPrice:
      product.previousPrice == null ? undefined : Number(product.previousPrice),
    description: product.description,
    shortDescription: product.shortDescription,
    featured: product.featured,
    popular: product.popular,
    stock: product.stock,
    status: product.status,
    image: primary?.url ?? "#dce4d6",
    images: product.images.map((image) => ({
      id: image.id,
      mediaId: image.mediaId,
      url: image.url,
      alt: image.alt,
      order: image.order,
      isPrimary: image.isPrimary,
    })),
    videos: product.videos.map((video) => ({
      id: video.id,
      mediaId: video.mediaId,
      url: video.media.url,
      mimeType: video.media.mimeType,
      order: video.order,
    })),
    usageInstructions: product.usageInstructions,
    benefits: product.benefits,
    specifications: product.specifications,
    seoTitle: product.seoTitle,
    metaDescription: product.metaDescription,
  };
}
