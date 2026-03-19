-- VALIDACION MVP DB
-- Ejecutar en Supabase SQL Editor para evidencia de entrega.

-- =====================================================
-- 1) Integridad de datos (CHECK constraints en Payment)
-- =====================================================
select conname
from pg_constraint
where conrelid = '"Payment"'::regclass
  and conname in (
    'Payment_splitCount_check',
    'Payment_paxPaid_check',
    'Payment_subtotal_check',
    'Payment_tipAmount_check',
    'Payment_totalAmount_check',
    'Payment_amountPaid_check',
    'Payment_total_ge_subtotal_check'
  )
order by conname;

-- Esperado: 7 filas.

-- =====================================================
-- 2) Unicidad operativa (mesa por restaurante)
-- =====================================================
select indexname
from pg_indexes
where schemaname = 'public'
  and tablename = 'Table'
  and indexname = 'Table_restaurantId_number_key';

-- Esperado: 1 fila.

-- =====================================================
-- 3) Indices de uso real
-- =====================================================
select tablename, indexname
from pg_indexes
where schemaname = 'public'
  and (
    (tablename = 'Payment' and indexname in (
      'Payment_restaurantId_createdAt_idx',
      'Payment_sessionId_createdAt_idx',
      'Payment_status_createdAt_idx'
    ))
    or
    (tablename = 'Order' and indexname in (
      'Order_restaurantId_createdAt_idx',
      'Order_status_createdAt_idx'
    ))
  )
order by tablename, indexname;

-- Esperado: 5 filas.

-- =====================================================
-- 4) Auditoria minima (updatedAt consistente)
-- =====================================================
select table_name, column_name
from information_schema.columns
where table_schema = 'public'
  and column_name = 'updatedAt'
  and table_name in ('Category','Staff','Session','OrderItem','Payment','PaymentAllocation')
order by table_name;

-- Esperado: 6 filas.

-- =====================================================
-- 5) RLS habilitado + politicas tenant
-- =====================================================
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('Restaurant','Table','Category','MenuItem','Staff','Session','Order','OrderItem','Payment','PaymentAllocation')
order by c.relname;

-- Esperado: todas con rls_enabled = true.

select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and policyname like '%_scope'
order by tablename, policyname;

-- Esperado: >= 20 politicas (segun fragmentacion por rol).

-- =====================================================
-- 6) Prueba funcional RLS por restaurante
-- Reemplaza <RESTAURANT_ID_REAL> por uno existente.
-- =====================================================

-- Caso A: ID correcto -> debe ver datos
set local role authenticated;
set local "app.current_restaurant_id" = '<RESTAURANT_ID_REAL>';
select count(*) as restaurants_visible_ok from "Restaurant";

-- Caso B: ID incorrecto -> debe ver 0
set local role authenticated;
set local "app.current_restaurant_id" = '00000000-0000-0000-0000-000000000000';
select count(*) as restaurants_visible_blocked from "Restaurant";
