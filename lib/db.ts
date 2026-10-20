import { PrismaClient } from "@prisma/client";

const g = globalThis as unknown as { db?: PrismaClient };

// The database is far from Ethiopia, so allow transactions more time than the 5 second default.
export const db = g.db ?? new PrismaClient({ transactionOptions: { maxWait: 15000, timeout: 30000 } });

if (process.env.NODE_ENV !== "production") g.db = db;