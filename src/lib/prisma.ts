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

/** Node `pg` v8+ maps `sslmode=require` to verify-full; Supabase + algunos entornos necesitan semántica libpq. */
function withPgLibpqCompat(connectionString: string) {
  if (/[?&]uselibpqcompat=/.test(connectionString)) return connectionString;
  return connectionString.includes("?")
    ? `${connectionString}&uselibpqcompat=true`
    : `${connectionString}?uselibpqcompat=true`;
}

function createPrismaClient() {
  const connectionString = withPgLibpqCompat(getDatabaseConnectionString());
  // Pass a PoolConfig instead of a Pool instance to avoid type mismatches
  // between different `pg`/`@types/pg` copies.
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }
  const fresh = createPrismaClient();
  globalForPrisma.prisma = fresh;
  return fresh;
}

export const prisma = getPrisma();
