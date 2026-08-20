import { PrismaClient, Role, PublishStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const adminEmail = process.env.SEED_ADMIN_EMAIL;
const adminPassword = process.env.SEED_ADMIN_PASSWORD;
const adminName = process.env.SEED_ADMIN_NAME || "مدیر جوانه سبز";

if (!adminEmail || !adminPassword || adminPassword.length < 12) {
  throw new Error(
    "SEED_ADMIN_EMAIL and a SEED_ADMIN_PASSWORD of at least 12 characters are required.",
  );
}

const categories = [
  ["کودهای آلی", "organic-fertilizers"],
  ["کودهای کامل", "complete-fertilizers"],
  ["ریزمغذی‌ها", "micronutrients"],
  ["اصلاح‌کننده خاک", "soil-conditioners"],
  ["محرک رشد", "growth-stimulants"],
];

const products = [
  {
    slug: "bio-root",
    sku: "JS-BR-001",
    name: "ریشه‌زای زیستی بایو روت",
    category: "organic-fertilizers",
    price: 385000,
    stock: 18,
    featured: true,
    image: "#dce4d6",
    description:
      "ریشه‌زای زیستی برای توسعه ریشه‌های فعال، استقرار بهتر نهال و افزایش جذب عناصر غذایی.",
  },
  {
    slug: "granular-organic",
    sku: "JS-GO-002",
    name: "کود آلی گرانوله جوانه",
    category: "organic-fertilizers",
    price: 520000,
    stock: 32,
    featured: true,
    image: "#d7c8aa",
    description:
      "کود آلی گرانوله مناسب باغ‌های پسته برای بهبود ساختمان خاک و افزایش فعالیت زیستی.",
  },
  {
    slug: "liquid-organic",
    sku: "JS-LO-003",
    name: "کود آلی مایع سبزینه",
    category: "growth-stimulants",
    price: 445000,
    stock: 24,
    featured: true,
    image: "#bfccb2",
    description:
      "کود آلی مایع غنی از ترکیبات طبیعی برای بهبود رشد رویشی و کاهش تنش گیاه.",
  },
  {
    slug: "calcium-nitrate",
    sku: "JS-CN-004",
    name: "نیترات کلسیم",
    category: "micronutrients",
    price: 690000,
    stock: 15,
    featured: false,
    image: "#dce4d6",
    description:
      "منبع محلول کلسیم و نیتروژن برای افزایش کیفیت بافت گیاهی و مدیریت کمبود کلسیم.",
  },
  {
    slug: "npk-10-50-10",
    sku: "JS-NPK-005",
    name: "کود ۱۰-۵۰-۱۰",
    category: "complete-fertilizers",
    price: 575000,
    stock: 27,
    featured: true,
    image: "#b5c7a6",
    description:
      "کود کامل با فسفر بالا برای تقویت ریشه‌زایی و حمایت از مراحل آغازین رشد.",
  },
];

async function main() {
  const passwordHash = await hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: { name: adminName, role: Role.ADMIN, passwordHash },
    create: {
      email: adminEmail.toLowerCase(),
      name: adminName,
      role: Role.ADMIN,
      passwordHash,
    },
  });

  const categoryIds = new Map();
  for (const [name, slug] of categories) {
    const category = await prisma.category.upsert({
      where: { slug },
      update: { name, visible: true, status: PublishStatus.PUBLISHED },
      create: { name, slug, visible: true, status: PublishStatus.PUBLISHED },
    });
    categoryIds.set(slug, category.id);
  }

  for (const product of products) {
    const { category, image, ...data } = product;
    await prisma.product.upsert({
      where: { slug: data.slug },
      update: {
        ...data,
        categoryId: categoryIds.get(category),
        status: PublishStatus.PUBLISHED,
      },
      create: {
        ...data,
        shortDescription: data.description,
        categoryId: categoryIds.get(category),
        status: PublishStatus.PUBLISHED,
        benefits: [
          "بهبود جذب عناصر",
          "کمک به رشد متعادل",
          "مناسب برنامه تغذیه کارشناسی",
        ],
        specifications: {
          form: "قابل مصرف در برنامه تغذیه",
          audience: "باغداران و کشاورزان حرفه‌ای",
        },
        images: {
          create: [{ url: image, alt: data.name, order: 0, isPrimary: true }],
        },
      },
    });
  }

  await prisma.siteSetting.upsert({
    where: { key: "activeTheme" },
    update: {},
    create: { key: "activeTheme", value: "natural" },
  });
  await prisma.siteSetting.upsert({
    where: { key: "homepage" },
    update: {},
    create: {
      key: "homepage",
      value: {
        heroTitle: "رشد بهتر از یک انتخاب درست آغاز می‌شود",
        heroSubtitle: "راهکارهای تخصصی تغذیه و سلامت گیاه برای باغ‌های پربار",
        ctaText: "مشاهده محصولات",
        ctaLink: "/shop",
      },
    },
  });

  await prisma.article.upsert({
    where: { slug: "pistachio-nutrition-guide" },
    update: {},
    create: {
      title: "راهنمای تغذیه اصولی باغ پسته",
      slug: "pistachio-nutrition-guide",
      excerpt: "اصول پایه برای برنامه‌ریزی تغذیه متعادل در باغ پسته",
      content:
        "برنامه تغذیه باید بر پایه آزمون خاک و برگ، مرحله رشد و نظر کارشناس تنظیم شود.",
      status: PublishStatus.PUBLISHED,
      authorId: admin.id,
      publishedAt: new Date(),
    },
  });

  if ((await prisma.event.count({ where: { title: "کارگاه مدیریت تغذیه باغ پسته" } })) === 0) {
    await prisma.event.create({
      data: {
        title: "کارگاه مدیریت تغذیه باغ پسته",
        description: "کارگاه کاربردی برای باغداران و کارشناسان کشاورزی",
        startsAt: new Date("2026-11-15T06:30:00Z"),
        location: "کرمان",
        status: PublishStatus.PUBLISHED,
      },
    });
  }

  if ((await prisma.representative.count()) === 0) {
    await prisma.representative.create({
      data: {
        name: "نمایندگی مرکزی کرمان",
        province: "کرمان",
        city: "کرمان",
        mobile: "09120000000",
        address: "کرمان، مرکز خدمات کشاورزی",
        status: PublishStatus.PUBLISHED,
      },
    });
  }

  console.log(
    `Seed complete. Admin: ${admin.email}; products: ${products.length}.`,
  );
}

main().finally(() => prisma.$disconnect());
