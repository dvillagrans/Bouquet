# 🚀 Guía de Configuración de Buquet

## Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Supabase
- Cuenta de Stripe
- Git instalado

## 1. Configuración de Supabase

### Crear Proyecto
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Guarda la URL y las claves (anon key y service role key)

### Crear Tablas
1. Ve a la pestaña "SQL Editor" en tu proyecto de Supabase
2. Copia y pega el contenido del archivo `docs/schema.sql`
3. Ejecuta el script para crear todas las tablas, políticas RLS e índices

### Configurar RLS
Las políticas RLS ya están configuradas en el script SQL. Verifica que:
- Todas las tablas tengan RLS habilitado
- Las políticas permitan lectura para sesiones abiertas
- Las políticas permitan escritura según corresponda

## 2. Configuración de Stripe

### Obtener Claves
1. Ve a [stripe.com](https://stripe.com) y crea una cuenta
2. Ve a Developers > API keys
3. Copia la Secret key (comienza con `sk_test_`)
4. Copia la Publishable key (comienza con `pk_test_`)

### Configurar Webhook
1. Ve a Developers > Webhooks
2. Clic en "Add endpoint"
3. URL del webhook: `https://tu-dominio.vercel.app/api/webhooks/stripe`
   - Para desarrollo local: usa [Stripe CLI](https://stripe.com/docs/stripe-cli)
4. Selecciona los eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Guarda el Webhook Secret (comienza con `whsec_`)

## 3. Configuración del Proyecto

### Instalar Dependencias
```bash
npm install
```

### Variables de Entorno
1. Copia el archivo `.env.example` a `.env.local`:
```bash
cp .env.example .env.local
```

2. Edita `.env.local` y completa todas las variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_tu-secret-key
STRIPE_WEBHOOK_SECRET=whsec_tu-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu-publishable-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. Desarrollo Local

### Iniciar Servidor de Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Probar Webhooks Localmente (Stripe CLI)
```bash
# Instalar Stripe CLI (si no lo tienes)
# macOS: brew install stripe/stripe-cli/stripe
# Linux: https://stripe.com/docs/stripe-cli#install

# Login
stripe login

# Escuchar webhooks
npm run stripe:listen
```

Esto te dará un webhook secret temporal para usar en `.env.local`

## 5. Testing

### Crear una Sesión de Prueba
1. Ve a `http://localhost:3000`
2. Clic en "Crear sesión (Restaurante)"
3. Completa el formulario y crea la sesión
4. Guarda el código generado (ej: `ABC123`)

### Unirse como Comensal
1. Ve a `http://localhost:3000/join/ABC123` (usando tu código)
2. Ingresa tu nombre
3. Selecciona los items que consumiste
4. Procede al pago

### Probar Pagos con Stripe
Usa tarjetas de prueba de Stripe:
- Tarjeta exitosa: `4242 4242 4242 4242`
- CVV: cualquier 3 dígitos
- Fecha: cualquier fecha futura
- Código postal: cualquier 5 dígitos

## 6. Despliegue en Vercel

### Conectar Repositorio
1. Ve a [vercel.com](https://vercel.com) y crea una cuenta
2. Importa tu repositorio de GitHub
3. Vercel detectará automáticamente que es un proyecto Next.js

### Configurar Variables de Entorno
En Vercel, ve a Settings > Environment Variables y agrega todas las variables de `.env.local`

### Desplegar
```bash
# Vercel despliega automáticamente cada push a main
git push origin main

# O despliega manualmente
npx vercel
```

### Actualizar Webhook de Stripe
1. Ve a Stripe > Developers > Webhooks
2. Actualiza la URL del webhook con tu dominio de Vercel:
   `https://tu-app.vercel.app/api/webhooks/stripe`

## 7. Verificación

### Checklist de Configuración
- [ ] Supabase: Proyecto creado y tablas configuradas
- [ ] Supabase: RLS habilitado en todas las tablas
- [ ] Stripe: Claves obtenidas
- [ ] Stripe: Webhook configurado
- [ ] Variables de entorno configuradas
- [ ] Aplicación corriendo localmente
- [ ] Webhooks funcionando (Stripe CLI para local)
- [ ] Prueba de flujo completo exitosa
- [ ] Despliegue en Vercel funcionando
- [ ] Webhook de producción actualizado

## Solución de Problemas

### Error: "Sesión no encontrada"
- Verifica que hayas ejecutado el script SQL en Supabase
- Verifica que las claves de Supabase sean correctas

### Error: "Stripe webhook signature verification failed"
- Verifica que el webhook secret sea correcto
- Si es local, asegúrate de estar usando el secret de Stripe CLI
- Si es producción, usa el secret del dashboard de Stripe

### Error: "Error al crear PaymentIntent"
- Verifica que la clave secreta de Stripe sea correcta
- Verifica que no haya errores en los logs de Stripe

### La aplicación no se ve correctamente
- Ejecuta `npm install` para asegurar que todas las dependencias estén instaladas
- Verifica que Tailwind CSS esté configurado correctamente
- Limpia el caché: `rm -rf .next && npm run dev`

## Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Stripe](https://stripe.com/docs)
- [Guía de PWA](https://web.dev/progressive-web-apps/)

## Soporte

Si encuentras problemas, revisa:
1. Los logs de la consola del navegador
2. Los logs de Next.js en la terminal
3. Los logs de Supabase en el dashboard
4. Los logs de Stripe en el dashboard
