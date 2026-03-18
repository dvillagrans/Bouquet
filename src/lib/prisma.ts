import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseConnectionString() {
  const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

  if (!connectionString) {
    throw new Error(
      "Missing DATABASE_URL (or DIRECT_URL). Create a .env file from .env.example and set a valid PostgreSQL connection string.",
    );
  }

  const hasPlaceholder =
    connectionString.includes("[PROJECT-REF]") ||
    connectionString.includes("[PASSWORD]") ||
    connectionString.includes("[ANON-KEY]");

  if (hasPlaceholder) {
    throw new Error(
      "DATABASE_URL contains template placeholders. Replace [PROJECT-REF] and [PASSWORD] in your .env values before running the app.",
    );
  }

  return connectionString;
}

function createPrismaClient() {
  const connectionString = getDatabaseConnectionString();
  // Pass a PoolConfig instead of a Pool instance to avoid type mismatches
  // between different `pg`/`@types/pg` copies.
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
