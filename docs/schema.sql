-- Tabla de sesiones
create table if not exists public.sessions (
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

-- Tabla de items
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id) on delete cascade,
  name text not null,
  qty int not null default 1,
  unit_price numeric(12,2) not null,
  created_at timestamptz default now()
);

-- Tabla de asignaciones
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id) on delete cascade,
  item_id uuid references public.items(id) on delete cascade,
  guest_id text not null,
  fraction numeric(6,4) default 1.0
);

-- Tabla de pagos
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id) on delete cascade,
  guest_id text not null,
  provider text not null default 'stripe',
  provider_payment_id text,
  amount numeric(12,2) not null,
  status text not null,
  created_at timestamptz default now()
);

-- Tabla de logs de webhooks
create table if not exists public.webhook_logs (
  event_id text primary key,
  payload jsonb,
  received_at timestamptz default now()
);

-- Habilitar RLS en todas las tablas
alter table public.sessions enable row level security;
alter table public.items enable row level security;
alter table public.assignments enable row level security;
alter table public.payments enable row level security;
alter table public.webhook_logs enable row level security;

-- Políticas RLS para sessions
create policy "read_open_sessions"
on public.sessions for select
using (status = 'open');

create policy "create_sessions"
on public.sessions for insert
with check (true);

-- Políticas RLS para items
create policy "read_items_by_session"
on public.items for select
using (session_id in (select id from public.sessions where status = 'open'));

create policy "insert_items"
on public.items for insert
with check (session_id in (select id from public.sessions where status = 'open'));

-- Políticas RLS para assignments
create policy "read_assignments_by_session"
on public.assignments for select
using (session_id in (select id from public.sessions where status = 'open'));

create policy "insert_own_assignments"
on public.assignments for insert
with check (true);

-- Políticas RLS para payments
create policy "read_payments_by_session"
on public.payments for select
using (session_id in (select id from public.sessions where status = 'open'));

create policy "insert_payments"
on public.payments for insert
with check (true);

-- Índices para mejorar el rendimiento
create index if not exists idx_sessions_code on public.sessions(code);
create index if not exists idx_sessions_status on public.sessions(status);
create index if not exists idx_items_session_id on public.items(session_id);
create index if not exists idx_assignments_session_id on public.assignments(session_id);
create index if not exists idx_assignments_guest_id on public.assignments(guest_id);
create index if not exists idx_payments_session_id on public.payments(session_id);
create index if not exists idx_payments_guest_id on public.payments(guest_id);

-- Función para obtener el total de un guest
create or replace function get_total_for_guest(p_session uuid, p_guest text)
returns numeric
language plpgsql
as $$
declare
  v_total numeric := 0;
  v_tax_rate numeric;
  v_tip_rate numeric;
  v_subtotal numeric := 0;
begin
  -- Obtener las tasas de la sesión
  select tax_rate, tip_rate into v_tax_rate, v_tip_rate
  from public.sessions
  where id = p_session;

  -- Calcular subtotal del guest
  select coalesce(sum(i.unit_price * i.qty * a.fraction), 0) into v_subtotal
  from public.assignments a
  join public.items i on i.id = a.item_id
  where a.session_id = p_session
    and a.guest_id = p_guest;

  -- Calcular total con impuestos y propina
  v_total := v_subtotal + (v_subtotal * v_tax_rate / 100) + (v_subtotal * v_tip_rate / 100);

  return v_total;
end;
$$;
