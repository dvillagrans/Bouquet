

# 🍽️ Buquet — Divide. Paga. Disfruta.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/) [![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E)](https://supabase.com/) [![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF)](https://stripe.com/) [![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000)](https://vercel.com/) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Buquet** es una **Progressive Web App (PWA)** que permite **dividir cuentas en restaurantes** de forma transparente, rápida y segura.
Cada comensal escanea el QR de la mesa, elige sus consumos y paga su parte directamente con Stripe.
El restaurante recibe el total conciliado, sin cálculos manuales ni confusiones.

---

## 🧩 Arquitectura General

```mermaid
flowchart LR
  A[Cliente · Next.js PWA] -->|HTTP| B[(API Routes en Vercel)]
  B --> C[(Supabase · PostgreSQL)]
  B --> D[(Stripe API)]
  D --> E[Webhook /api/webhooks/stripe]
  C <--> B
  B --> F[Supabase Edge Functions (opcionales)]

  classDef default fill:#fff,stroke:#333,stroke-width:1px;
```

**Stack técnico**

* **Frontend / PWA:** Next.js 15 + TypeScript + TailwindCSS + shadcn/ui
* **Backend (serverless):** Route Handlers en Vercel (`/app/api/**`)
* **Base de Datos:** Supabase (PostgreSQL) con **Row Level Security (RLS)**
* **Pagos:** Stripe (Payment Intents + Webhooks)
* **Estado:** Zustand + TanStack Query
* **Autenticación:** Supabase Auth (Magic Link / anónimo por sesión)
* **Despliegue:** Vercel (auto CI/CD desde GitHub)

---

## ⚙️ Funcionalidad Principal (MVP)

| Módulo                     | Descripción                                      |
| -------------------------- | ------------------------------------------------ |
| 🪑 **Sesiones de mesa**    | El restaurante crea una sesión (QR con `code`).  |
| 📋 **Items del ticket**    | Se registran los platillos y bebidas consumidos. |
| 👥 **Asignación de items** | Cada comensal selecciona lo que consumió.        |
| 💸 **División automática** | Cálculo de IVA, propina y fracciones.            |
| 💳 **Pagos individuales**  | Cada comensal paga con Stripe (PaymentIntent).   |
| 🧾 **Resumen final**       | Vista consolidada del total y estado de pagos.   |

---

## 🧱 Estructura del Proyecto

```
buquet/
├─ app/
│  ├─ (public)/join/[code]/page.tsx        # Unirse a mesa
│  ├─ (host)/host/[sessionId]/page.tsx     # Vista del restaurante
│  ├─ summary/[sessionId]/page.tsx         # Resumen de sesión
│  ├─ api/
│  │  ├─ sessions/route.ts                 # Crear sesión
│  │  ├─ items/route.ts                    # Registrar items
│  │  ├─ assign/route.ts                   # Asignar items
│  │  ├─ payments/intent/route.ts          # Crear PaymentIntent (Stripe)
│  │  └─ webhooks/stripe/route.ts          # Webhook Stripe (runtime=nodejs)
│  └─ layout.tsx / globals.css
├─ lib/
│  ├─ db.ts                                # Supabase server client
│  ├─ supabase.ts                          # Client-side Supabase
│  ├─ payments/stripe.ts                   # Stripe SDK helper
│  ├─ schemas.ts                           # Zod schemas
│  └─ utils.ts                             # Helpers (formateo, cálculos)
├─ components/
│  ├─ ui/                                  # shadcn/ui
│  ├─ ItemCard.tsx                         # Selección de platillos
│  └─ SplitSummary.tsx                     # Resumen dinámico
├─ store/
│  └─ useSplitStore.ts                     # Estado (Zustand)
├─ public/
│  ├─ manifest.json                        # PWA manifest
│  └─ icons/
├─ .env.example
├─ next.config.mjs
├─ package.json
└─ README.md
```

---

## 🗄️ Modelo de Datos (Supabase · PostgreSQL)

```sql
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  restaurant_name text not null,
  currency text not null default 'MXN',
  tip_rate numeric(5,2) default 10,
  tax_rate numeric(5,2) default 16,
  status text default 'open',
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id) on delete cascade,
  name text not null,
  qty int not null default 1,
  unit_price numeric(12,2) not null,
  created_at timestamptz default now()
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id) on delete cascade,
  item_id uuid references public.items(id) on delete cascade,
  guest_id text not null,
  fraction numeric(6,4) default 1.0
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id) on delete cascade,
  guest_id text not null,
  provider text not null default 'stripe',
  provider_payment_id text,
  amount numeric(12,2) not null,
  status text not null,
  created_at timestamptz default now()
);

create table public.webhook_logs (
  event_id text primary key,
  payload jsonb,
  received_at timestamptz default now()
);
```

---

## 🔐 Políticas RLS Recomendadas

**sessions**

```sql
-- Lectura: cualquiera con el code
create policy "read_open_sessions"
on public.sessions for select
using (status = 'open');
```

**items, assignments, payments**

```sql
create policy "read_by_session"
on public.items for select
using (session_id in (select id from public.sessions where status = 'open'));

create policy "insert_own_assignments"
on public.assignments for insert
with check (guest_id = auth.uid()::text or guest_id like 'guest-%');
```

> ⚠️ Recuerda habilitar RLS en cada tabla (`alter table ... enable row level security;`)

---

## 💳 Integración con Stripe

**`app/api/payments/intent/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { sessionId, guestId } = await req.json();

  // 1. Calcular total real en servidor
  const { data: total } = await supabaseAdmin.rpc("get_total_for_guest", {
    p_session: sessionId,
    p_guest: guestId
  });

  // 2. Crear PaymentIntent seguro
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100),
    currency: "mxn",
    metadata: { sessionId, guestId }
  });

  return NextResponse.json({ clientSecret: intent.client_secret });
}
```

**`app/api/webhooks/stripe/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const { id: eventId, type } = event;

  // Idempotencia: ignorar eventos procesados
  const { data: existing } = await supabaseAdmin
    .from("webhook_logs")
    .select("event_id")
    .eq("event_id", eventId)
    .single();

  if (existing) return new NextResponse("Duplicate", { status: 200 });
  await supabaseAdmin.from("webhook_logs").insert({ event_id: eventId, payload: event });

  if (type === "payment_intent.succeeded") {
    const payment = event.data.object as Stripe.PaymentIntent;
    await supabaseAdmin.from("payments").insert({
      session_id: payment.metadata.sessionId,
      guest_id: payment.metadata.guestId,
      provider_payment_id: payment.id,
      amount: payment.amount / 100,
      status: "succeeded"
    });
  }

  return new NextResponse("ok", { status: 200 });
}
```

---

## 🔢 Variables de entorno (`.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://buquet.vercel.app
```

---

## 🚀 Despliegue

1. **Conecta tu repo** a **Vercel**
2. Agrega las **variables de entorno**
3. **Build automática:**

   ```bash
   pnpm install
   pnpm build
   pnpm start
   ```
4. **Configura el Webhook en Stripe**

   * Endpoint: `https://tu-dominio.vercel.app/api/webhooks/stripe`
   * Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`

---

## 🧭 Roadmap Técnico

* [ ] Implementar **Mercado Pago** como método alterno
* [ ] Soporte **multimoneda** y tasas dinámicas
* [ ] Exportar recibos en PDF (worker o Supabase function)
* [ ] **Modo offline** (cache + reintentos)
* [ ] Panel de restaurante con analítica básica
* [ ] Integración de **facturación CFDI 4.0 (México)**

---

## 🧠 Buenas Prácticas

* Recalcular siempre el monto **en servidor** antes del PaymentIntent.
* Implementar **idempotencia** en webhooks.
* Usar **Zod** para validar todo input externo.
* Mantener **RLS habilitado** en todas las tablas.
* Evitar que el cliente escriba directamente en la DB (solo API o RPC seguras).

---

## 🧪 Scripts útiles

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "db:push": "supabase db push",
    "stripe:listen": "stripe listen --forward-to localhost:3000/api/webhooks/stripe"
  }
}
```

---

## 📄 Licencia

MIT © 2025 — Buquet
Desarrollado con ❤️ por Diego Villagrán Salazar