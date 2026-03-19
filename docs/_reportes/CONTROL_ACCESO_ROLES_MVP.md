# Control De Acceso Por Roles (MVP)

## Estado
Se implemento RLS por restaurante y por rol en Supabase con migraciones:

- `role_based_rls_controls`
- `role_based_rls_fixes`

El sistema usa dos atributos de contexto:

- `restaurant_id`: restaurante activo (tenant)
- `app_role`: rol funcional (`OWNER`, `ADMIN`, `MESERO`, `COCINA`, `BARRA`)

Tambien se soporta seteo por variable de sesion SQL:

- `app.current_restaurant_id`
- `app.current_role`

## Matriz De Acceso

### OWNER / ADMIN
- Acceso total al restaurante completo.
- Lectura/escritura en operaciones, catalogos, personal, sesiones, ordenes y pagos.

### MESERO
- Puede ver y operar mesas, sesiones, ordenes y pagos del restaurante activo.
- No puede administrar personal ni catalogo global.

### COCINA
- No ve pagos.
- Solo ve/actualiza ordenes y partidas relevantes a su estacion (`COCINA`) dentro del restaurante activo.

### BARRA
- No ve pagos.
- Solo ve/actualiza ordenes y partidas relevantes a su estacion (`BARRA`) dentro del restaurante activo.

## Pruebas Rapidas (SQL Editor)

```sql
-- Mesero: sesiones visibles
set local role authenticated;
set local "app.current_restaurant_id" = '<RESTAURANT_ID>';
set local "app.current_role" = 'MESERO';
select count(*) from "Session";

-- Cocina: pagos bloqueados
set local role authenticated;
set local "app.current_restaurant_id" = '<RESTAURANT_ID>';
set local "app.current_role" = 'COCINA';
select count(*) from "Payment";
```

## Integracion En App (Importante)
Para que el control por rol se aplique en runtime:

1. El token JWT del usuario autenticado debe incluir `restaurant_id` y `app_role`.
2. Si se usa SQL directo/sesion, setear `app.current_restaurant_id` y `app.current_role` por request.
3. Evitar ejecutar queries de usuario final con credenciales privilegiadas que bypassean RLS.

## Nota MVP
Con esto ya queda la fragmentacion base para entrega:

- Admin/dueno monitorean todo el restaurante.
- Meseros operan piso/cuentas.
- Cocina y barra ven solo su cola operativa.
