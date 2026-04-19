-- AlterEnum: add CANCELLED for guest-cancelled orders (only while PENDING).
-- Safe to run in Supabase SQL Editor (PostgreSQL 15+: IF NOT EXISTS supported).
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';
