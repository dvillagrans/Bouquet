# Bouquet — Gobernanza de Datos y Control de Acceso

> Última actualización: Mayo 2026

---

## Jerarquía de Roles

```
PLATFORM_ADMIN        ← Super-admin de toda la plataforma
  └── CHAIN_ADMIN     ← Admin de una cadena (ej. "Grupo La Casa")
        └── ZONE_MANAGER  ← Gerente de zona (ej. "Zona Norte CDMX")
              └── RESTAURANT_ADMIN  ← Admin de sucursal
                    ├── ADMIN      ← Admin local (alias)
                    ├── MESERO     ← Mesero
                    ├── COCINA     ← Cocinero
                    └── BARRA      ← Personal de barra
```

Cada rol tiene un `contextType` (PLATFORM | CHAIN | ZONE | RESTAURANT) que determina a qué entidad está vinculado. Un mismo `AppUser` puede tener múltiples roles en distintos contextos.

---

## Matriz de Acceso por Ruta

| Ruta | Roles con acceso |
|------|-----------------|
| `/admin` | `PLATFORM_ADMIN` |
| `/cadena` | `PLATFORM_ADMIN`, `CHAIN_ADMIN` |
| `/zona` | `PLATFORM_ADMIN`, `CHAIN_ADMIN`, `ZONE_MANAGER` |
| `/dashboard` | Cualquier rol de restaurante o superior |
| `/mesero` | `PLATFORM_ADMIN`, `CHAIN_ADMIN`, `ZONE_MANAGER`, `RESTAURANT_ADMIN`, `ADMIN`, `MESERO` |
| `/cocina` | `PLATFORM_ADMIN`, `CHAIN_ADMIN`, `ZONE_MANAGER`, `RESTAURANT_ADMIN`, `ADMIN`, `COCINA` |
| `/barra` | `PLATFORM_ADMIN`, `CHAIN_ADMIN`, `ZONE_MANAGER`, `RESTAURANT_ADMIN`, `ADMIN`, `BARRA` |
| `/mesa/[codigo]` | Público (comensales) |
| `/login` | Público |
| `/api/login` | Público |

## Redirecciones Post-Login

| Rol | Redirección |
|-----|------------|
| `PLATFORM_ADMIN` | `/admin` |
| `CHAIN_ADMIN` | `/cadena` |
| `ZONE_MANAGER` | `/zona` |
| `COCINA` | `/cocina` |
| `BARRA` | `/barra` |
| `ADMIN` / `MESERO` / `RESTAURANT_ADMIN` | `/mesero` |

---

## Credenciales de Prueba

> ⚠️ **SOLO PARA DESARROLLO LOCAL.** En producción, cada instalación genera sus propias credenciales. Cambiá `temporal123` apenas deployes.

### Super Admin (Plataforma)

| Email | Contraseña | Rol | Contexto |
|-------|-----------|-----|----------|
| `admin@bouquet.com` | `temporal123` | `PLATFORM_ADMIN` | Plataforma |

> Este usuario se crea automáticamente al llamar `POST /api/seed-manager`.

### Admin de Cadena, Zona y Restaurante

Estos usuarios **no existen por defecto**. Se crean desde la UI de Super Admin (`/admin`):

1. Iniciá sesión como `admin@bouquet.com` / `temporal123`
2. Creá una **Cadena** (ej. "Grupo Demo")
3. Dentro de la cadena, creá una **Zona** (ej. "Zona Centro")
4. Dentro de la zona, creá un **Restaurante** (ej. "Sucursal Lindavista")
5. Desde la consola de cadena (`/cadena`), asigná un **CHAIN_ADMIN**
6. Desde la consola de zona (`/zona`), asigná un **ZONE_MANAGER**
7. Desde el dashboard del restaurante, creá staff (**MESERO**, **COCINA**, **BARRA**)

### Staff de Restaurante (Mesero, Cocinero, Barra)

Los empleados de restaurante se crean desde `/dashboard` → Gestión de Staff. El sistema genera:
- **Email**: `staff-{timestamp}@bouquet.internal` (autogenerado)
- **Contraseña**: 8 caracteres aleatorios

Para desarrollo, se recomienda usar la API de seed o el script de abajo para crear usuarios con contraseñas conocidas.

### Script Rápido de Seed (TypeScript)

Creá un archivo `scripts/seed-governance.ts` y ejecutalo con `npx tsx`:

```typescript
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth-password";

const prisma = new PrismaClient();

async function main() {
  // ── 1. Asegurar roles base ──
  const roles = [
    { id: "role-platform-admin", name: "PLATFORM_ADMIN", scope: "PLATFORM" },
    { id: "role-chain-admin", name: "CHAIN_ADMIN", scope: "CHAIN" },
    { id: "role-zone-manager", name: "ZONE_MANAGER", scope: "ZONE" },
    { id: "role-restaurant-admin", name: "RESTAURANT_ADMIN", scope: "RESTAURANT" },
    { id: "role-mesero", name: "MESERO", scope: "RESTAURANT" },
    { id: "role-cocina", name: "COCINA", scope: "RESTAURANT" },
    { id: "role-barra", name: "BARRA", scope: "RESTAURANT" },
  ];
  for (const r of roles) {
    await prisma.role.upsert({ where: { id: r.id }, update: {}, create: { ...r, isBase: true, isActive: true } });
  }

  // ── 2. Crear moneda por defecto ──
  await prisma.currency.upsert({
    where: { code: "MXN" },
    update: {},
    create: { code: "MXN", name: "Peso Mexicano", symbol: "$" },
  });

  // ── 3. Crear usuario PLATFORM_ADMIN ──
  const adminUser = await prisma.appUser.upsert({
    where: { email: "admin@bouquet.com" },
    update: {},
    create: {
      email: "admin@bouquet.com",
      passwordHash: await hashPassword("temporal123"),
      firstName: "Admin",
      lastName: "Bouquet",
      isActive: true,
      userRoles: { create: { roleId: "role-platform-admin", contextType: "PLATFORM" } },
    },
  });

  // ── 4. Crear Cadena de prueba ──
  const chain = await prisma.chain.create({
    data: {
      createdBy: adminUser.id,
      currency: "MXN",
      name: "Grupo Demo",
    },
  });

  // ── 5. Crear CHAIN_ADMIN ──
  const chainAdmin = await prisma.appUser.create({
    data: {
      email: "cadena@bouquet.demo",
      passwordHash: await hashPassword("demo123"),
      firstName: "Admin",
      lastName: "Cadena",
      isActive: true,
      userRoles: { create: { roleId: "role-chain-admin", contextType: "CHAIN", chainId: chain.id } },
    },
  });

  // ── 6. Crear Zona de prueba ──
  const zone = await prisma.zone.create({
    data: { chainId: chain.id, name: "Zona Centro" },
  });

  // ── 7. Crear ZONE_MANAGER ──
  const zoneManager = await prisma.appUser.create({
    data: {
      email: "zona@bouquet.demo",
      passwordHash: await hashPassword("demo123"),
      firstName: "Gerente",
      lastName: "Zona",
      isActive: true,
      userRoles: {
        create: [
          { roleId: "role-zone-manager", contextType: "ZONE", chainId: chain.id, zoneId: zone.id },
        ],
      },
    },
  });

  // ── 8. Crear Restaurante de prueba ──
  const restaurant = await prisma.restaurant.create({
    data: {
      chainId: chain.id,
      zoneId: zone.id,
      currency: "MXN",
      name: "Sucursal Lindavista",
    },
  });

  // ── 9. Crear RESTAURANT_ADMIN ──
  const restAdmin = await prisma.appUser.create({
    data: {
      email: "restaurante@bouquet.demo",
      passwordHash: await hashPassword("demo123"),
      firstName: "Admin",
      lastName: "Restaurante",
      isActive: true,
      userRoles: {
        create: [
          { roleId: "role-restaurant-admin", contextType: "RESTAURANT", chainId: chain.id, zoneId: zone.id, restaurantId: restaurant.id },
        ],
      },
    },
  });

  // ── 10. Crear MESERO ──
  const mesero = await prisma.appUser.create({
    data: {
      email: "mesero@bouquet.demo",
      passwordHash: await hashPassword("demo123"),
      firstName: "Carlos",
      lastName: "Mesero",
      isActive: true,
      userRoles: {
        create: [
          { roleId: "role-mesero", contextType: "RESTAURANT", chainId: chain.id, zoneId: zone.id, restaurantId: restaurant.id },
        ],
      },
    },
  });

  // ── 11. Crear COCINERO ──
  const cocinero = await prisma.appUser.create({
    data: {
      email: "cocina@bouquet.demo",
      passwordHash: await hashPassword("demo123"),
      firstName: "María",
      lastName: "Cocina",
      isActive: true,
      userRoles: {
        create: [
          { roleId: "role-cocina", contextType: "RESTAURANT", chainId: chain.id, zoneId: zone.id, restaurantId: restaurant.id },
        ],
      },
    },
  });

  console.log("✅ Seed de gobernanza completado.");
  console.log(`   Chain:        ${chain.name} (${chain.id})`);
  console.log(`   Zone:         ${zone.name} (${zone.id})`);
  console.log(`   Restaurant:   ${restaurant.name} (${restaurant.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

### Tabla Resumen de Credenciales de Prueba

Una vez ejecutado el script de seed:

| Email | Contraseña | Rol | Accede a |
|-------|-----------|-----|----------|
| `admin@bouquet.com` | `temporal123` | `PLATFORM_ADMIN` | `/admin` |
| `cadena@bouquet.demo` | `demo123` | `CHAIN_ADMIN` | `/cadena` |
| `zona@bouquet.demo` | `demo123` | `ZONE_MANAGER` | `/zona` |
| `restaurante@bouquet.demo` | `demo123` | `RESTAURANT_ADMIN` | `/mesero` |
| `mesero@bouquet.demo` | `demo123` | `MESERO` | `/mesero` |
| `cocina@bouquet.demo` | `demo123` | `COCINA` | `/cocina` |

---

## Mecanismo de Autenticación

### Tipo
**JWT custom** firmado con HMAC-SHA256 vía Web Crypto API.

### Cookies
| Cookie | Alcance | Uso |
|--------|---------|-----|
| `bq_session` | Todos los roles | Sesión unificada para AppUser |
| `bq_admin_session` | `PLATFORM_ADMIN` | Sesión exclusiva para admin de plataforma |

### Hash de Contraseñas
- Algoritmo: `scrypt`
- Salt: 16 bytes aleatorios
- Formato almacenado: `scrypt:v1:{salt_hex}:{derived_hex}`

### Secretos (orden de lectura)
1. `AUTH_SECRET` (variable de entorno)
2. `NEXTAUTH_SECRET` (fallback)
3. `BOUQUET_ADMIN_AUTH_SECRET` (fallback para admin)
4. Hardcodeado en desarrollo (⚠️ solo para `NODE_ENV=development`)

### Duración
- Token JWT: 24 horas
- Cookie: 24 horas

---

## Flujo de Login

```
Usuario → /login
  ↓
POST /api/login { email, password }
  ↓
Buscar AppUser por email
  ↓
Verificar passwordHash con scrypt
  ↓
Leer UserRole → Role activos
  ↓
Generar JWT firmado
  ↓
Setear cookie httpOnly (bq_session)
  ↓
Redirigir según rol más específico
```

### Endpoints de login
| Endpoint | Uso |
|----------|-----|
| `POST /api/login` | Login unificado (cualquier AppUser con UserRole) |
| `POST /api/admin/login` | Login exclusivo para PLATFORM_ADMIN |

---

## Permisos Granulares (RBAC)

El modelo `Permission` + `RolePermission` existe en el esquema pero **no se usa activamente en los guards actuales**. Los guards de ruta (`layout.tsx` de cada módulo) verifican por nombre de rol (`role.name`), no por permisos individuales.

Si en el futuro se implementa RBAC granular, la tabla `Permission` ya tiene códigos como `CREATE_ORDER`, `VIEW_SETTLEMENTS`, `MANAGE_ADJUSTMENTS`, etc.

---

## Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `prisma/schema.prisma` | Modelos AppUser, Role, UserRole, Chain, Zone, Restaurant |
| `prisma/seed_super_admin.sql` | Seed SQL del super-admin inicial |
| `src/app/api/seed-manager/route.ts` | Endpoint HTTP para crear roles base + admin por defecto |
| `src/app/api/login/route.ts` | Login unificado |
| `src/app/api/admin/login/route.ts` | Login exclusivo PLATFORM_ADMIN |
| `src/lib/auth-session.ts` | Creación/verificación de JWT `bq_session` |
| `src/lib/admin-session.ts` | Creación/verificación de JWT `bq_admin_session` |
| `src/lib/auth-password.ts` | Hash/verify con scrypt |
| `src/lib/auth-server.ts` | `getCurrentSession()` para server components |
| `src/middleware-logic.ts` | Proxy de rutas `/restaurant/[id]/...` |
| `src/actions/staff.ts` | CRUD de staff de restaurante |
| `src/actions/chain.ts` | CRUD de cadena/zona/restaurante + asignación de admins |
| `docs/GOVERNANCE.md` | Este documento |

---

## Buenas Prácticas

1. **NUNCA** comitear contraseñas reales. Las de este documento son SOLO para desarrollo.
2. Rotar `temporal123` apenas se despliegue a staging/producción.
3. Usar `AUTH_SECRET` en `.env` (nunca en el código).
4. Los staff de restaurante deben crearse desde la UI, no manualmente en DB.
5. Un usuario puede tener múltiples roles en distintos contextos (ej: `CHAIN_ADMIN` de una cadena y `ZONE_MANAGER` de una zona dentro de otra cadena).
