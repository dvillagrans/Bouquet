-- Crear tabla de códigos de staff
CREATE TABLE IF NOT EXISTS staff_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  created_by VARCHAR(255) NOT NULL, -- ID o nombre del staff que creó el código
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 10, -- Máximo número de usos permitidos
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_staff_codes_restaurant_id ON staff_codes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_codes_code ON staff_codes(code);
CREATE INDEX IF NOT EXISTS idx_staff_codes_active ON staff_codes(active);
CREATE INDEX IF NOT EXISTS idx_staff_codes_expires_at ON staff_codes(expires_at);

-- Índice compuesto para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_staff_codes_restaurant_code_active 
  ON staff_codes(restaurant_id, code, active);

-- Habilitar RLS
ALTER TABLE staff_codes ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Staff codes are viewable by authenticated users" ON staff_codes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Staff codes can be managed by authenticated users" ON staff_codes
  FOR ALL USING (auth.role() = 'authenticated');

-- Función para limpiar códigos expirados automáticamente
CREATE OR REPLACE FUNCTION cleanup_expired_staff_codes()
RETURNS void AS $$
BEGIN
  UPDATE staff_codes 
  SET active = false 
  WHERE expires_at < NOW() AND active = true;
END;
$$ LANGUAGE plpgsql;

-- Función para validar código de staff
CREATE OR REPLACE FUNCTION validate_staff_code(
  p_restaurant_id UUID,
  p_code VARCHAR(10)
)
RETURNS TABLE(
  valid BOOLEAN,
  message TEXT,
  code_id UUID
) AS $$
DECLARE
  code_record staff_codes%ROWTYPE;
BEGIN
  -- Limpiar códigos expirados primero
  PERFORM cleanup_expired_staff_codes();
  
  -- Buscar el código
  SELECT * INTO code_record
  FROM staff_codes
  WHERE restaurant_id = p_restaurant_id
    AND code = p_code
    AND active = true
    AND expires_at > NOW()
    AND used_count < max_uses;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Código inválido, expirado o agotado'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Código válido
  RETURN QUERY SELECT true, 'Código válido'::TEXT, code_record.id;
END;
$$ LANGUAGE plpgsql;

-- Función para incrementar el uso de un código
CREATE OR REPLACE FUNCTION increment_staff_code_usage(p_code_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE staff_codes
  SET used_count = used_count + 1,
      updated_at = NOW()
  WHERE id = p_code_id
    AND active = true
    AND used_count < max_uses;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_staff_codes_updated_at
  BEFORE UPDATE ON staff_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunos códigos de ejemplo para testing
INSERT INTO staff_codes (restaurant_id, code, created_by, expires_at, max_uses)
SELECT 
  r.id,
  '1234',
  'admin',
  NOW() + INTERVAL '24 hours',
  50
FROM restaurants r
WHERE r.slug = 'bouquet'
ON CONFLICT DO NOTHING;

INSERT INTO staff_codes (restaurant_id, code, created_by, expires_at, max_uses)
SELECT 
  r.id,
  '5678',
  'manager',
  NOW() + INTERVAL '12 hours',
  25
FROM restaurants r
WHERE r.slug = 'bouquet'
ON CONFLICT DO NOTHING;