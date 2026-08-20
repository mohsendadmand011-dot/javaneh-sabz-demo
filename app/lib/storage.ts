import { randomUUID } from "node:crypto";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredMedia = {
  storageKey: string;
  storedFilename: string;
  url: string;
  mimeType: string;
  fileType: "IMAGE" | "VIDEO";
  size: number;
  width: number | null;
  height: number | null;
  duration: number | null;
};

type MediaKind = Omit<
  StoredMedia,
  "storageKey" | "storedFilename" | "url" | "size"
> & {
  extension: string;
};

const signatures: Array<{
  mimeType: string;
  fileType: "IMAGE" | "VIDEO";
  extensions: string[];
  matches: (bytes: Uint8Array) => boolean;
}> = [
  {
    mimeType: "image/jpeg",
    fileType: "IMAGE",
    extensions: [".jpg", ".jpeg"],
    matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mimeType: "image/png",
    fileType: "IMAGE",
    extensions: [".png"],
    matches: (b) =>
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
        (v, i) => b[i] === v,
      ),
  },
  {
    mimeType: "image/webp",
    fileType: "IMAGE",
    extensions: [".webp"],
    matches: (b) => text(b, 0, 4) === "RIFF" && text(b, 8, 12) === "WEBP",
  },
  {
    mimeType: "image/gif",
    fileType: "IMAGE",
    extensions: [".gif"],
    matches: (b) => ["GIF87a", "GIF89a"].includes(text(b, 0, 6)),
  },
  {
    mimeType: "video/mp4",
    fileType: "VIDEO",
    extensions: [".mp4"],
    matches: (b) => text(b, 4, 8) === "ftyp",
  },
  {
    mimeType: "video/webm",
    fileType: "VIDEO",
    extensions: [".webm"],
    matches: (b) =>
      b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3,
  },
];

function text(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.slice(start, end));
}

function imageDimensions(bytes: Uint8Array, mime: string) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (mime === "image/png" && bytes.length >= 24)
    return { width: view.getUint32(16), height: view.getUint32(20) };
  if (mime === "image/gif" && bytes.length >= 10)
    return { width: view.getUint16(6, true), height: view.getUint16(8, true) };
  if (mime === "image/jpeg") {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) break;
      const marker = bytes[offset + 1];
      const length = view.getUint16(offset + 2);
      if (
        [
          0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd,
          0xce, 0xcf,
        ].includes(marker)
      )
        return {
          height: view.getUint16(offset + 5),
          width: view.getUint16(offset + 7),
        };
      offset += 2 + length;
    }
  }
  if (
    mime === "image/webp" &&
    bytes.length >= 30 &&
    text(bytes, 12, 16) === "VP8X"
  )
    return {
      width: 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16),
      height: 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16),
    };
  return { width: null, height: null };
}

function videoDuration(bytes: Uint8Array, mime: string) {
  if (mime !== "video/mp4") return null;
  for (let offset = 4; offset + 32 < bytes.length; offset += 1) {
    if (text(bytes, offset, offset + 4) !== "mvhd") continue;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const version = bytes[offset + 4];
    const timescaleOffset = version === 1 ? offset + 24 : offset + 16;
    const durationOffset = version === 1 ? offset + 28 : offset + 20;
    const timescale = view.getUint32(timescaleOffset);
    if (!timescale) return null;
    const duration =
      version === 1
        ? Number(view.getBigUint64(durationOffset))
        : view.getUint32(durationOffset);
    return Math.round(duration / timescale);
  }
  return null;
}

function positiveLimit(name: string, fallback: number) {
  const value = Number(process.env[name] || fallback);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function mediaRoot() {
  return path.resolve(
    process.env.MEDIA_STORAGE_PATH ||
      process.env.UPLOAD_DIR ||
      "./data/uploads",
  );
}

export function mediaPath(storageKey: string) {
  const root = mediaRoot();
  const target = path.resolve(root, path.basename(storageKey));
  if (path.dirname(target) !== root || path.basename(storageKey) !== storageKey)
    throw new Error("INVALID_STORAGE_KEY");
  return target;
}

export async function inspectMedia(
  file: File,
): Promise<{ bytes: Uint8Array; kind: MediaKind }> {
  if (!file.name || file.size < 1) throw new Error("EMPTY_FILE");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const signature = signatures.find((item) => item.matches(bytes));
  if (!signature) throw new Error("UNSUPPORTED_OR_INVALID_SIGNATURE");
  const extension = path.extname(file.name).toLowerCase();
  if (!signature.extensions.includes(extension))
    throw new Error("INVALID_FILE_EXTENSION");
  if (file.type && file.type !== signature.mimeType)
    throw new Error("MIME_TYPE_MISMATCH");
  const maxMb = positiveLimit(
    signature.fileType === "IMAGE"
      ? "MAX_IMAGE_UPLOAD_MB"
      : "MAX_VIDEO_UPLOAD_MB",
    signature.fileType === "IMAGE" ? 10 : 250,
  );
  if (file.size > maxMb * 1024 * 1024) throw new Error("FILE_TOO_LARGE");
  const dimensions = imageDimensions(bytes, signature.mimeType);
  return {
    bytes,
    kind: {
      mimeType: signature.mimeType,
      fileType: signature.fileType,
      extension: signature.extensions[0],
      ...dimensions,
      duration: videoDuration(bytes, signature.mimeType),
    },
  };
}

export interface MediaStorageProvider {
  put(file: File): Promise<StoredMedia>;
  remove(storageKey: string): Promise<void>;
  replace(storageKey: string, file: File): Promise<StoredMedia>;
}

export class LocalStorageProvider implements MediaStorageProvider {
  async put(file: File) {
    const { bytes, kind } = await inspectMedia(file);
    const root = mediaRoot();
    await mkdir(root, { recursive: true });
    const storageKey = `${randomUUID()}${kind.extension}`;
    await writeFile(mediaPath(storageKey), bytes, { flag: "wx" });
    const base = (process.env.MEDIA_PUBLIC_URL || "/media").replace(/\/$/, "");
    return {
      storageKey,
      storedFilename: storageKey,
      url: `${base}/${storageKey}`,
      mimeType: kind.mimeType,
      fileType: kind.fileType,
      size: bytes.byteLength,
      width: kind.width,
      height: kind.height,
      duration: kind.duration,
    };
  }

  async remove(storageKey: string) {
    await unlink(mediaPath(storageKey)).catch(
      (error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
      },
    );
  }

  async replace(storageKey: string, file: File) {
    const replacement = await this.put(file);
    await this.remove(storageKey);
    return replacement;
  }
}

export function storageProvider(): MediaStorageProvider {
  const provider =
    process.env.MEDIA_STORAGE_PROVIDER ||
    process.env.STORAGE_PROVIDER ||
    "local";
  if (provider !== "local") throw new Error("STORAGE_PROVIDER_NOT_IMPLEMENTED");
  return new LocalStorageProvider();
}

export async function readStoredMedia(storageKey: string) {
  const target = mediaPath(storageKey);
  return { bytes: await readFile(target), size: (await stat(target)).size };
}

export function safeOriginalFilename(value: string) {
  return (
    path
      .basename(value)
      .replace(/[^\p{L}\p{N}._ -]+/gu, "_")
      .slice(0, 255) || "media"
  );
}

// Compatibility wrappers retained for existing callers.
export async function storeImage(file: File) {
  const stored = await storageProvider().put(file);
  if (stored.fileType !== "IMAGE") {
    await storageProvider().remove(stored.storageKey);
    throw new Error("UNSUPPORTED_IMAGE");
  }
  return stored;
}

export async function removeStoredImage(storageKey: string | null) {
  if (storageKey) await storageProvider().remove(storageKey);
}
