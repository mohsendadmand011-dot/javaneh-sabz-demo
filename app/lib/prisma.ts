import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prismaGlobal = globalThis as typeof globalThis & {
  __javanehPrisma?: PrismaClient;
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

export const prisma =
  prismaGlobal.__javanehPrisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

if (process.env.NODE_ENV !== "production")
  prismaGlobal.__javanehPrisma = prisma;
