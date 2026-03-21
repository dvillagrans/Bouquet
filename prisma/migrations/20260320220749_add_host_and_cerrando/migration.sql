-- Add CERRANDO status to TableStatus enum
ALTER TYPE "TableStatus" ADD VALUE IF NOT EXISTS 'CERRANDO';

-- Add isHost field to Session
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "isHost" BOOLEAN NOT NULL DEFAULT false;
