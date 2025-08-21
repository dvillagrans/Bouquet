-- Otorgar permisos a los roles anon y authenticated para las nuevas tablas

-- Permisos para la tabla restaurants
GRANT SELECT ON restaurants TO anon;
GRANT SELECT ON restaurants TO authenticated;
GRANT ALL PRIVILEGES ON restaurants TO authenticated;

-- Permisos para la tabla staff_codes
GRANT SELECT ON staff_codes TO anon;
GRANT ALL PRIVILEGES ON staff_codes TO authenticated;

-- Permisos para la tabla tables
GRANT SELECT, INSERT ON tables TO anon;
GRANT ALL PRIVILEGES ON tables TO authenticated;

-- Permisos para ejecutar las funciones
GRANT EXECUTE ON FUNCTION validate_staff_code(UUID, VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION validate_staff_code(UUID, VARCHAR) TO authenticated;

GRANT EXECUTE ON FUNCTION create_table(UUID, VARCHAR, VARCHAR, VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION create_table(UUID, VARCHAR, VARCHAR, VARCHAR) TO authenticated;

GRANT EXECUTE ON FUNCTION find_table_by_join_code(VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION find_table_by_join_code(VARCHAR) TO authenticated;

GRANT EXECUTE ON FUNCTION close_table(UUID) TO authenticated;

GRANT EXECUTE ON FUNCTION generate_unique_join_code() TO anon;
GRANT EXECUTE ON FUNCTION generate_unique_join_code() TO authenticated;

GRANT EXECUTE ON FUNCTION cleanup_expired_tables() TO anon;
GRANT EXECUTE ON FUNCTION cleanup_expired_tables() TO authenticated;

GRANT EXECUTE ON FUNCTION cleanup_expired_staff_codes() TO anon;
GRANT EXECUTE ON FUNCTION cleanup_expired_staff_codes() TO authenticated;

GRANT EXECUTE ON FUNCTION increment_staff_code_usage(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_staff_code_usage(UUID) TO authenticated;

-- Verificar permisos otorgados
SELECT 
  grantee, 
  table_name, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND grantee IN ('anon', 'authenticated')
  AND table_name IN ('restaurants', 'staff_codes', 'tables')
ORDER BY table_name, grantee;