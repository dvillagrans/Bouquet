# Directorio de Rutas - Plataforma Bouquet

A continuación se enlistan las rutas principales de los diferentes dashboards y vistas de la plataforma, organizadas por nivel de acceso o rol operativo:

## 🌐 Nivel Plataforma (SaaS)
Super administradores del sistema Bouquet.
- **Super Admin Dashboard:** [`/admin`](/admin)

## 🏢 Nivel Inquilino / Cadena (Nivel 1)
Dueños de grupos restauranteros o cadenas.
- **Dashboard de Cadena:** [`/cadena`](/cadena)

## 📍 Nivel Zona / Sucursal (Nivel 2)
Gerentes de restaurante o zona específica.
- **Dashboard de Zona:** [`/zona`](/zona)
- *(El dashboard genérico [`/dashboard`](/dashboard) también puede funcionar como alias o redirección de sucursal dependiendo de la autenticación).*

## 🍽️ Nivel Operativo (Staff del Restaurante)
Personal del día a día dentro de cada restaurante.

- **Dashboard de Meseros:** [`/mesero`](/mesero)
  - *Vista de creación/seguimiento de órdenes e interacción directa con clientes.*
- **Dashboard de Cocina:** [`/cocina`](/cocina)
  - *KDS (Kitchen Display System) para ver y despachar comandas físicas.*
- **Dashboard de Barra (Bebidas):** [`/barra`](/barra)
  - *Vista tipo KDS pero filtrada solo para coctelería y bebidas.*

## 📱 Nivel Comensal / Cliente
Interactúan con los códigos QR en mesa.
- **Menú de Mesa / Pedido de Comensal:** [`/mesa`](/mesa)
  - *(Normalmente se acompaña de un ID, por ej: `/mesa/[mesaId]`)*

## ⚙️ Rutas de utilidad / Desarrollo
- **Administración de Roles:** [`/roles`](/roles)
