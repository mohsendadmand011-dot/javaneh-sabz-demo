import { Role } from "@prisma/client";
import { requireRole } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { safeOriginalFilename, storageProvider } from "../../lib/storage";

const uploadWindows = new Map<string, number[]>();
function permitUpload(userId: string) {
  const now = Date.now();
  const recent = (uploadWindows.get(userId) || []).filter(
    (time) => now - time < 60_000,
  );
  if (recent.length >= 30) return false;
  recent.push(now);
  uploadWindows.set(userId, recent);
  return true;
}

export async function GET(request: Request) {
  const auth = await requireRole(request, [Role.ADMIN, Role.EDITOR]);
  if ("error" in auth) return auth.error;
  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim().slice(0, 100);
  const type = url.searchParams.get("type");
  const sort = url.searchParams.get("sort") === "oldest" ? "asc" : "desc";
  return Response.json({
    media: await prisma.media.findMany({
      where: {
        ...(type === "IMAGE" || type === "VIDEO" ? { fileType: type } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { alt: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: sort },
      take: 500,
    }),
  });
}

export async function POST(request: Request) {
  const auth = await requireRole(request, [Role.ADMIN, Role.EDITOR]);
  if ("error" in auth) return auth.error;
  if (!permitUpload(auth.user.id))
    return Response.json(
      { error: "تعداد بارگذاری در یک دقیقه بیش از حد مجاز است." },
      { status: 429 },
    );
  const form = await request.formData();
  const files = [...form.getAll("files"), form.get("file")].filter(
    (value): value is File => value instanceof File && value.size > 0,
  );
  if (!files.length)
    return Response.json(
      { error: "حداقل یک فایل الزامی است." },
      { status: 400 },
    );
  if (files.length > 20)
    return Response.json(
      { error: "حداکثر ۲۰ فایل در هر درخواست مجاز است." },
      { status: 400 },
    );
  const alt =
    String(form.get("alt") || "")
      .trim()
      .slice(0, 300) || null;
  const caption =
    String(form.get("caption") || "")
      .trim()
      .slice(0, 1000) || null;
  const provider = storageProvider();
  const created = [];
  try {
    for (const file of files) {
      const stored = await provider.put(file);
      try {
        created.push(
          await prisma.media.create({
            data: {
              name: safeOriginalFilename(file.name),
              originalFilename: safeOriginalFilename(file.name),
              alt,
              caption,
              uploadedByUserId: auth.user.id,
              ...stored,
            },
          }),
        );
      } catch (error) {
        await provider.remove(stored.storageKey);
        throw error;
      }
    }
    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        action: "UPLOAD",
        entity: "Media",
        metadata: { count: created.length },
      },
    });
    return Response.json({ media: created, item: created[0] }, { status: 201 });
  } catch (error) {
    console.error("Media upload failed", error);
    return Response.json(
      {
        error: "بارگذاری فایل ناموفق بود.",
        code: error instanceof Error ? error.message : "UPLOAD_FAILED",
      },
      { status: 400 },
    );
  }
}
