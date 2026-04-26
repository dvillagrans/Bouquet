# Plan Maestro de Flujos de la App Bouquet (MVP)

Fecha: 23-04-2026
Objetivo: completar y validar todos los flujos funcionales clave de la app por rol, con orden de ejecución y criterios de aceptación.

## 1) Flujos Plataforma (Super Admin)

### 1.1 Login de admin global
- Ruta UI: `/admin/login`
- API: `POST /api/admin/login`
- Cierre de sesión: `POST /api/admin/logout`
- Criterios de aceptación:
  - Credenciales válidas permiten sesión.
  - Credenciales inválidas muestran error controlado.
  - Logout invalida sesión y redirige correctamente.

### 1.2 Dashboard SaaS (control de clientes y billing)
- Rutas UI:
  - `/admin`
  - `/admin/clientes`
  - `/admin/billing`
  - `/admin/system`
- Actions:
  - `getSuperAdminDashboard`
  - `getAdminClientesList`
  - `getAdminBillingOverview`
  - `createTenant`
- Criterios de aceptación:
  - Métricas cargan sin error.
  - Alta de tenant persiste y se refleja en listado.
  - No hay fuga de datos de un tenant a otro.

## 2) Flujos Cadena (Nivel 1)

### 2.1 Acceso y dashboard de cadena
- Ruta UI: `/cadena`
- Action: `getChainDashboard`
- Criterios de aceptación:
  - Visualiza restaurantes, zonas y KPIs esperados.

### 2.2 Gestión de zonas
- Ruta UI: `/cadena/zonas`
- Actions:
  - `renameChainZone`
  - `verifyZonePin`
- Criterios de aceptación:
  - Renombrado persistente.
  - Verificación por PIN funciona y bloquea intentos inválidos.

### 2.3 Plantillas de menú por cadena
- Ruta UI: `/cadena/plantillas`
- Actions:
  - `getChainMenuTemplates`
  - `createChainMenuTemplate`
- Criterios de aceptación:
  - Crear plantilla con estructura válida.
  - Reutilizable en restaurante de la cadena.

### 2.4 Staff de cadena y auditoría
- Rutas UI:
  - `/cadena/staff`
  - `/cadena/auditoria`
- Actions:
  - `getChainStaffList`
  - `createChainStaffMember`
  - `setChainStaffActive`
  - `getChainAuditOverview`
- Criterios de aceptación:
  - Alta/baja lógica de personal.
  - Eventos relevantes visibles en auditoría.

### 2.5 Gestión de restaurante dentro de cadena
- Ruta UI: `/cadena/restaurantes/[restaurantId]`
- Action: `getChainRestaurantDossier`
- Criterios de aceptación:
  - Vista integral por restaurante correcta.

## 3) Flujos Zona / Sucursal (Nivel 2)

### 3.1 Dashboard zona
- Ruta UI: `/zona`
- Action: `getZoneDashboard`
- Criterios de aceptación:
  - KPIs de sucursal consistentes.

### 3.2 Sucursales y configuración de zona
- Rutas UI:
  - `/zona/sucursales`
  - `/zona/settings`
- Actions:
  - `getZoneSettings`
  - `rotateZonePin`
- Criterios de aceptación:
  - Configuración se guarda.
  - Rotación de PIN invalida PIN previo.

### 3.3 Staff de zona
- Ruta UI: `/zona/staff`
- Actions:
  - `getZoneStaff`
  - `createZoneStaffMember`
  - `setRestaurantAdminActive`
- Criterios de aceptación:
  - Alta/estado de personal operativo correcto.

## 4) Flujos Operativos Restaurante

### 4.1 Dashboard sucursal (alias operativo)
- Ruta UI: `/dashboard`
- Action: `getRestaurantOverview`
- Criterios de aceptación:
  - Carga operativa sin datos cruzados entre sucursales.

### 4.2 Menú (categorías, items, disponibilidad)
- Ruta UI: `/dashboard/menu`
- Actions:
  - `getMenuData`
  - `createCategory`
  - `createMenuItem`
  - `updateMenuItem`
  - `toggleItemSoldOut`
  - `deleteMenuItem`
- Criterios de aceptación:
  - CRUD completo de categorías/items.
  - Variantes y estaciones (COCINA/BARRA) correctas.

### 4.3 Mesas y layout
- Ruta UI: `/dashboard/mesas`
- Actions:
  - `getTables`
  - `createTable`
  - `updateTableStatus`
  - `deleteTable`
  - `updateTablePositions`
  - `getSignedGuestPreviewUrl`
- Criterios de aceptación:
  - Altas/bajas/cambios de estado.
  - Posicionamiento persistente de plano.

### 4.4 Staff de sucursal
- Ruta UI: `/dashboard/staff`
- Actions:
  - `getStaffData`
  - `createStaffMember`
  - `toggleStaffStatus`
  - `deleteStaffMember`
- Criterios de aceptación:
  - Gestión de personal sin errores de permisos.

### 4.5 Reportería
- Ruta UI: `/dashboard/reportes`
- Action: `getDashboardReports`
- Criterios de aceptación:
  - Reportes con filtros válidos y consistencia temporal.

### 4.6 Ajustes sucursal
- Ruta UI: `/dashboard/settings`
- Action: `updateRestaurantSettings`
- Criterios de aceptación:
  - Persistencia correcta de cambios globales de sucursal.

## 5) Flujos Mesero

### 5.1 Vista de operación de mesas
- Ruta UI: `/mesero`
- Actions:
  - `getWaiterTablesSummary`
  - `getTableDetail`
- Criterios de aceptación:
  - Estado de mesa y cuentas en tiempo real.

### 5.2 Toma de orden por mesero
- Ruta UI: `/mesero`
- Action: `waiterCreateOrder`
- Criterios de aceptación:
  - Orden creada en estado inicial PENDING.
  - Impacta en KDS y vista comensal.

### 5.3 Control de ciclo de mesa
- Ruta UI: `/mesero`
- Actions:
  - `updateTableStatus`
  - `closeTable`
  - `regenerateTableQr`
- Criterios de aceptación:
  - Cambios de estado válidos por reglas del negocio.
  - Rotación QR solo en mesa libre.

## 6) Flujos Cocina y Barra (KDS)

### 6.1 Cola de pedidos en producción
- Rutas UI:
  - `/cocina`
  - `/barra`
- Actions:
  - `getLiveOrders`
  - `advanceOrderStatus`
  - `undoOrderStatus`
  - `moveOrderToStatus`
- Criterios de aceptación:
  - Transiciones de estado válidas.
  - Refresco en vivo en KDS y comensal.

## 7) Flujos Comensal (QR)

### 7.1 Entrada por QR y gate de sesión
- Rutas UI:
  - `/scan`
  - `/mesa/[codigo]`
- API/Actions:
  - `GET /api/mesa/join-proof`
  - `guestJoinTable`
  - `getGuestTableState`
- Criterios de aceptación:
  - Join gate válido y seguro.
  - Manejo de mesa inexistente/sucia/cerrando.

### 7.2 Menú y pedidos comensal
- Ruta UI: `/mesa/[codigo]/menu`
- Actions:
  - `submitComensalOrder`
  - `getGuestOrders`
  - `cancelGuestOrder`
- Criterios de aceptación:
  - Órdenes propias y compartidas consistentes.
  - Restricción de cancelación por estado.

### 7.3 Cuenta, pagos y cierre
- Ruta UI: `/mesa/[codigo]/cuenta`
- Actions:
  - `getTableBill`
  - `payGuestShare`
  - `requestBill`
  - `requestBillAndPay`
  - `transferHost`
- Criterios de aceptación:
  - Cálculo correcto de individual y compartido.
  - Pago parcial/total consistente.
  - Cierre controlado por reglas de host/faltantes.

## 8) APIs auxiliares
- `POST /api/chat`
- `POST /api/guest-menu-ai`
- `POST /api/seed-manager`
- `GET/POST /dashboard/impersonate/[restaurantId]`
- Criterios de aceptación:
  - Manejo robusto de errores y validación de entrada.
  - Seguridad (auth/autz) aplicada.

## 9) Orden de ejecución recomendado (sprints)
1. Acceso y seguridad base:
   - Admin login/logout
   - Verificación pin cadena/zona
   - Join gate comensal
2. Core operativo:
   - Mesas + sesión comensal
   - Toma de órdenes mesero/comensal
   - KDS cocina/barra y transiciones
3. Dinero:
   - Cuenta de mesa
   - Pago individual/compartido
   - Cierre de mesa
4. Gestión:
   - Menú, staff, settings, reportes
5. Gobernanza SaaS:
   - Clientes, billing, auditoría, system

## 10) Entregables por flujo
- Caso de prueba manual (pasos y resultado esperado).
- Validación de permisos por rol.
- Evidencia mínima (captura/log) por aceptación.
- Registro de incidencias y fix aplicado.

## 11) Próxima ejecución inmediata
Comenzar por el bloque “Core operativo” con este orden:
1. `guestJoinTable` + `/mesa/[codigo]` + `/mesa/[codigo]/menu`
2. `submitComensalOrder` + reflejo en `/cocina`/`/barra`
3. `waiterCreateOrder` + consistencia de cuenta en `getTableBill`
4. `advanceOrderStatus`/`undoOrderStatus` y sincronía en vivo

Al completar estos 4 puntos, se desbloquea el flujo principal de negocio extremo a extremo.
