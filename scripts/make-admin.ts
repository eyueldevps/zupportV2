import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const email = process.argv[2]?.trim().toLowerCase();
if (!email) { console.log("Usage: npx tsx scripts/make-admin.ts you@email.com"); process.exit(1); }
db.user.update({ where: { email }, data: { role: "ADMIN" } })
  .then(() => console.log(`Done: ${email} is now an admin`))
  .catch(() => console.log("No account found with that email"))
  .finally(() => db.$disconnect());
