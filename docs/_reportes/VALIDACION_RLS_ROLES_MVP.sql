-- VALIDACION RLS POR ROLES (MVP)
-- Requisitos:
-- 1) Haber ejecutado SEED_PRUEBAS_ROLES_MVP.sql
-- 2) Reemplazar <RESTAURANT_ID_REAL>

-- ---------------------------------
-- OWNER/ADMIN ven todo del restaurante
-- ---------------------------------
set local role authenticated;
set local "app.current_restaurant_id" = '<RESTAURANT_ID_REAL>';
set local "app.current_role" = 'ADMIN';

select 'ADMIN' as role, count(*) as tables_visible from "Table";
select 'ADMIN' as role, count(*) as sessions_visible from "Session";
select 'ADMIN' as role, count(*) as orders_visible from "Order";
select 'ADMIN' as role, count(*) as order_items_visible from "OrderItem";
select 'ADMIN' as role, count(*) as payments_visible from "Payment";
select 'ADMIN' as role, count(*) as staff_visible from "Staff";

-- ---------------------------------
-- MESERO: opera piso/orden/pago, no staff
-- ---------------------------------
set local role authenticated;
set local "app.current_restaurant_id" = '<RESTAURANT_ID_REAL>';
set local "app.current_role" = 'MESERO';

select 'MESERO' as role, count(*) as tables_visible from "Table";
select 'MESERO' as role, count(*) as sessions_visible from "Session";
select 'MESERO' as role, count(*) as orders_visible from "Order";
select 'MESERO' as role, count(*) as order_items_visible from "OrderItem";
select 'MESERO' as role, count(*) as payments_visible from "Payment";

-- Esperado: este select debe fallar o devolver 0 segun politica vigente
select 'MESERO' as role, count(*) as staff_visible from "Staff";

-- ---------------------------------
-- COCINA: solo ordenes/items de cocina, no pagos
-- ---------------------------------
set local role authenticated;
set local "app.current_restaurant_id" = '<RESTAURANT_ID_REAL>';
set local "app.current_role" = 'COCINA';

select 'COCINA' as role, count(*) as orders_visible from "Order";
select 'COCINA' as role, count(*) as order_items_visible from "OrderItem";
select 'COCINA' as role, count(*) as payments_visible from "Payment";

-- ---------------------------------
-- BARRA: solo ordenes/items de barra, no pagos
-- ---------------------------------
set local role authenticated;
set local "app.current_restaurant_id" = '<RESTAURANT_ID_REAL>';
set local "app.current_role" = 'BARRA';

select 'BARRA' as role, count(*) as orders_visible from "Order";
select 'BARRA' as role, count(*) as order_items_visible from "OrderItem";
select 'BARRA' as role, count(*) as payments_visible from "Payment";

-- ---------------------------------
-- Aislamiento por restaurante (mismatch)
-- ---------------------------------
set local role authenticated;
set local "app.current_restaurant_id" = '00000000-0000-0000-0000-000000000000';
set local "app.current_role" = 'ADMIN';

select 'ADMIN_MISMATCH' as role, count(*) as restaurant_visible from "Restaurant";
select 'ADMIN_MISMATCH' as role, count(*) as tables_visible from "Table";
select 'ADMIN_MISMATCH' as role, count(*) as orders_visible from "Order";
