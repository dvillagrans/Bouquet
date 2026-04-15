# Diccionario de rutas y acciones de servidor (Bouquet)

Este proyecto **no define** handlers REST en `app/api` ni archivos `route.ts`. La comunicación cliente–servidor usa **Server Actions** de Next.js (`"use server"`): no son URLs públicas estables tipo `/api/recurso`, sino funciones invocadas por el runtime de Next.

---

## Rutas de página (URLs)

| Ruta | Descripción |
|------|-------------|
| `/` | Landing |
| `/admin` | Administración |
| `/barra` | Vista barra |
| `/cadena` | Dashboard cadena |
| `/cocina` | KDS / cocina |
| `/dashboard` | Dashboard principal |
| `/dashboard/menu` | Gestión de menú |
| `/dashboard/mesas` | Mesas (plano) |
| `/dashboard/reportes` | Reportes |
| `/dashboard/settings` | Ajustes |
| `/dashboard/staff` | Personal |
| `/mesa/[codigo]` | Entrada por QR de mesa |
| `/mesa/[codigo]/menu` | Menú comensal |
| `/mesa/[codigo]/cuenta` | Cuenta comensal |
| `/mesero` | Vista mesero |
| `/roles` | Roles |
| `/zona` | Vista zona |

---

## Server Actions por archivo

### `src/actions/chain.ts`

| Función | Descripción |
|---------|-------------|
| `getChainDashboard` | Datos del dashboard de cadena (zonas, restaurantes, estadísticas). |
| `getZoneDashboard` | Datos del dashboard de la primera zona encontrada. |

### `src/actions/restaurant.ts`

| Función | Descripción |
|---------|-------------|
| `getDefaultRestaurant` | Obtiene o crea el restaurante por defecto (demo); envuelto en `React.cache()`. |

### `src/actions/menu.ts`

| Función | Descripción |
|---------|-------------|
| `getMenuData` | Categorías e ítems del menú; crea categorías por defecto si no hay ninguna. |
| `createCategory` | Crea categoría (upsert por nombre + restaurante). |
| `toggleItemSoldOut` | Alterna estado agotado de un ítem. |
| `deleteMenuItem` | Elimina un ítem del menú. |
| `updateMenuItem` | Actualiza un ítem. |
| `createMenuItem` | Crea un ítem nuevo. |

### `src/actions/staff.ts`

| Función | Descripción |
|---------|-------------|
| `getStaffData` | Lista personal; si está vacío, crea registros por defecto. |
| `deleteStaffMember` | Elimina un miembro del staff. |
| `createStaffMember` | Crea un miembro del staff. |
| `toggleStaffStatus` | Activa o desactiva un miembro. |

### `src/actions/orders.ts`

| Función | Descripción |
|---------|-------------|
| `getLiveOrders` | Órdenes del día para la vista cocina (KDS). |
| `advanceOrderStatus` | Avanza el estado de la orden en el flujo estándar. |
| `undoOrderStatus` | Revierte el estado de la orden un paso. |
| `moveOrderToStatus` | Coloca la orden en un estado concreto. |

### `src/actions/tables.ts`

| Función | Descripción |
|---------|-------------|
| `getTables` | Lista mesas del restaurante por defecto. |
| `createTable` | Crea mesa con QR y posición en rejilla. |
| `updateTableStatus` | Actualiza estado de mesa (vista dashboard/mesas). |
| `deleteTable` | Elimina una mesa. |
| `updateTablePositions` | Persiste posiciones (y forma opcional) en el plano. |

### `src/actions/waiter.ts`

| Función | Descripción |
|---------|-------------|
| `updateTableStatus` | Actualiza estado de mesa; en `DISPONIBLE` rota QR y limpia código de unión. |
| `closeTable` | Cierra sesiones activas y marca mesa como `SUCIA`. |
| `getWaiterTablesSummary` | Resumen de mesas para la vista mesero. |
| `getTableDetail` | Detalle de mesa: sesión, órdenes, total. |
| `waiterCreateOrder` | Crea orden desde mesero (mesa ocupada y sesión activa). |
| `getMenuForOrdering` | Menú para tomar pedidos (excluye agotados). |

### `src/actions/reports.ts`

| Función | Descripción |
|---------|-------------|
| `getDashboardReports` | Estadísticas, top ítems y series para Hoy / Semana / Mes. |

### `src/actions/comensal.ts`

| Función | Descripción |
|---------|-------------|
| `submitComensalOrder` | Envía pedido desde el flujo comensal (QR). |
| `getTableBill` | Obtiene desglose de cuenta por comensal. |
| `guestJoinTable` | Une comensal a la mesa (código si no es el primero); establece cookies. |
| `payGuestShare` | Registra pago parcial de un comensal. |
| `requestBillAndPay` | Pago, cierre de sesión y mesa en estado sucio. |
| `transferHost` | Transfiere rol de anfitrión entre comensales. |
| `requestBill` | Anfitrión solicita la cuenta (estado mesa `CERRANDO` + broadcast). |
| `getGuestTableState` | Estado para UI invitado (anfitrión, cuenta pedida, lista, código). |
| `getGuestOrders` | Órdenes de la mesa visibles para el comensal. |

---

## Servicios externos

| Servicio | Uso |
|----------|-----|
| **PostgreSQL** | Base de datos vía Prisma (`DATABASE_URL`). |
| **Supabase** | Cliente SSR y canales en tiempo real (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`); p. ej. broadcast de órdenes/cuenta. |

---

## Nota sobre API REST

Para exponer contratos tipo **OpenAPI** o paths `/api/*` explícitos, habría que añadir **Route Handlers** en `app/api/.../route.ts` o un backend separado. El contrato actual son las funciones exportadas en `src/actions/`.
