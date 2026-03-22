-- Add CERRANDO status to TableStatus enum
ALTER TYPE "TableStatus" ADD VALUE IF NOT EXISTS 'CERRANDO';

-- Add isHost field to Session
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "isHost" BOOLEAN NOT NULL DEFAULT false;

-- Add joinCode to Table (nullable — null means empty table)
ALTER TABLE "Table" ADD COLUMN IF NOT EXISTS "joinCode" TEXT;
