-- Crear tabla de mesas
CREATE TABLE IF NOT EXISTS tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  join_code VARCHAR(6) UNIQUE NOT NULL,
  leader_name VARCHAR(255) NOT NULL,
  table_number VARCHAR(50), -- Número o identificador de mesa física (opcional)
  participant_count INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '4 hours'), -- Las mesas expiran en 4 horas
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_tables_restaurant_id ON tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_join_code ON tables(join_code);
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);
CREATE INDEX IF NOT EXISTS idx_tables_expires_at ON tables(expires_at);
CREATE INDEX IF NOT EXISTS idx_tables_created_at ON tables(created_at);

-- Índice compuesto para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_tables_restaurant_status 
  ON tables(restaurant_id, status);

-- Habilitar RLS
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Tables are viewable by everyone" ON tables
  FOR SELECT USING (true);

CREATE POLICY "Tables can be created by everyone" ON tables
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Tables can be updated by authenticated users" ON tables
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Tables can be deleted by authenticated users" ON tables
  FOR DELETE USING (auth.role() = 'authenticated');

-- Función para generar código de mesa único
CREATE OR REPLACE FUNCTION generate_unique_join_code()
RETURNS VARCHAR(6) AS $$
DECLARE
  new_code VARCHAR(6);
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generar código aleatorio de 6 caracteres (letras y números)
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    
    -- Verificar si el código ya existe
    SELECT EXISTS(SELECT 1 FROM tables WHERE join_code = new_code AND status = 'active') INTO code_exists;
    
    -- Si no existe, salir del loop
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar mesas expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_tables()
RETURNS void AS $$
BEGIN
  UPDATE tables 
  SET status = 'closed',
      updated_at = NOW()
  WHERE expires_at < NOW() 
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Función para crear una nueva mesa
CREATE OR REPLACE FUNCTION create_table(
  p_restaurant_id UUID,
  p_staff_code VARCHAR(10),
  p_leader_name VARCHAR(255),
  p_table_number VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  table_id UUID,
  join_code VARCHAR(6)
) AS $$
DECLARE
  validation_result RECORD;
  new_table_id UUID;
  new_join_code VARCHAR(6);
BEGIN
  -- Validar código de staff
  SELECT * INTO validation_result
  FROM validate_staff_code(p_restaurant_id, p_staff_code);
  
  IF NOT validation_result.valid THEN
    RETURN QUERY SELECT false, validation_result.message, NULL::UUID, NULL::VARCHAR(6);
    RETURN;
  END IF;
  
  -- Limpiar mesas expiradas
  PERFORM cleanup_expired_tables();
  
  -- Generar código único para la mesa
  new_join_code := generate_unique_join_code();
  
  -- Crear la mesa
  INSERT INTO tables (restaurant_id, join_code, leader_name, table_number)
  VALUES (p_restaurant_id, new_join_code, p_leader_name, p_table_number)
  RETURNING id INTO new_table_id;
  
  -- Incrementar el uso del código de staff
  PERFORM increment_staff_code_usage(validation_result.code_id);
  
  -- Retornar resultado exitoso
  RETURN QUERY SELECT true, 'Mesa creada exitosamente'::TEXT, new_table_id, new_join_code;
END;
$$ LANGUAGE plpgsql;

-- Función para buscar mesa por código de unión
CREATE OR REPLACE FUNCTION find_table_by_join_code(p_join_code VARCHAR(6))
RETURNS TABLE(
  id UUID,
  restaurant_id UUID,
  join_code VARCHAR(6),
  leader_name VARCHAR(255),
  table_number VARCHAR(50),
  participant_count INTEGER,
  status VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Limpiar mesas expiradas primero
  PERFORM cleanup_expired_tables();
  
  -- Buscar la mesa
  RETURN QUERY
  SELECT t.id, t.restaurant_id, t.join_code, t.leader_name, t.table_number, 
         t.participant_count, t.status, t.created_at, t.expires_at
  FROM tables t
  WHERE t.join_code = p_join_code
    AND t.status = 'active'
    AND t.expires_at > NOW();
END;
$$ LANGUAGE plpgsql;

-- Función para cerrar una mesa
CREATE OR REPLACE FUNCTION close_table(p_table_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE tables
  SET status = 'closed',
      updated_at = NOW()
  WHERE id = p_table_id
    AND status = 'active';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_tables_updated_at
  BEFORE UPDATE ON tables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para generar join_code automáticamente si no se proporciona
CREATE OR REPLACE FUNCTION set_join_code_if_null()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.join_code IS NULL OR NEW.join_code = '' THEN
    NEW.join_code := generate_unique_join_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tables_join_code
  BEFORE INSERT ON tables
  FOR EACH ROW
  EXECUTE FUNCTION set_join_code_if_null();