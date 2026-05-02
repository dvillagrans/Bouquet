-- ============================================================
-- SUPER ADMIN SEED (Login Centralizado)
-- ============================================================
-- Ejecutar esto directamente en PostgreSQL para crear el
-- usuario admin inicial con rol PLATFORM_ADMIN.
--
-- Credenciales por defecto:
--   Email:    [EMAIL_ADDRESS]
--   Password: [PASSWORD]
--
-- El passwordHash fue generado con scrypt (mismo algoritmo
-- usado por auth-password.ts):
--   salt     = ZZiYq9AjYKFtkSuaaaEbSg==
--   derived  = GpP66iGbv2tnAFVdKXxkeUZWjJTF2vwAvj9PsEUUa4E=
-- ============================================================

-- 0) Monedas base (idempotente)
INSERT INTO "Currency" (code, name, symbol, "isActive", "createdAt")
VALUES
  ('MXN', 'Peso Mexicano', '$', true, NOW()),
  ('USD', 'Dólar Estadounidense', '$', true, NOW()),
  ('EUR', 'Euro', '€', true, NOW())
ON CONFLICT (code) DO NOTHING;

-- 1) Rol base de plataforma (idempotente)
INSERT INTO "Role" (id, name, scope, "isBase", "isActive", "createdAt", "updatedAt")
VALUES (
  'role-platform-admin',
  'PLATFORM_ADMIN',
  'PLATFORM',
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name       = EXCLUDED.name,
  scope      = EXCLUDED.scope,
  "isBase"   = EXCLUDED."isBase",
  "isActive" = EXCLUDED."isActive",
  "updatedAt"= NOW();

-- 2) AppUser super admin (idempotente por email)
INSERT INTO "AppUser" (
  id,
  email,
  "passwordHash",
  "firstName",
  "lastName",
  "isActive",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'admin@bouquet.com',
  'scrypt:v1:ZZiYq9AjYKFtkSuaaaEbSg==:GpP66iGbv2tnAFVdKXxkeUZWjJTF2vwAvj9PsEUUa4E=',
  'Admin',
  'Bouquet',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  "firstName"    = EXCLUDED."firstName",
  "lastName"     = EXCLUDED."lastName",
  "isActive"     = EXCLUDED."isActive",
  "updatedAt"    = NOW();

-- 3) Asignar rol PLATFORM_ADMIN al AppUser (idempotente)
INSERT INTO "UserRole" (
  id,
  "userId",
  "roleId",
  "contextType",
  "chainId",
  "zoneId",
  "restaurantId",
  "assignedAt"
)
SELECT
  gen_random_uuid(),
  u.id,
  'role-platform-admin',
  'PLATFORM',
  NULL,
  NULL,
  NULL,
  NOW()
FROM "AppUser" u
WHERE u.email = 'admin@bouquet.com'
ON CONFLICT DO NOTHING;

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT
  u.id    AS app_user_id,
  u.email,
  u."firstName",
  u."lastName",
  u."isActive",
  r.name  AS role_name,
  r.scope AS role_scope,
  ur."contextType"
FROM "AppUser" u
JOIN "UserRole" ur ON ur."userId" = u.id
JOIN "Role"    r  ON r.id         = ur."roleId"
WHERE u.email = 'admin@bouquet.com';
