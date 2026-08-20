import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const emails = ["qa-customer@javaneh.local", "qa-editor@javaneh.local"];

if (process.argv[2] === "cleanup") {
  await prisma.user.deleteMany({ where: { email: { in: emails } } });
} else {
  const passwordHash = await bcrypt.hash("QA-Role-2026!", 12);
  for (const role of ["CUSTOMER", "EDITOR"]) {
    const email = `qa-${role.toLowerCase()}@javaneh.local`;
    await prisma.user.upsert({
      where: { email },
      update: { role, passwordHash },
      create: { email, name: `QA ${role}`, role, passwordHash },
    });
  }
}
await prisma.$disconnect();
