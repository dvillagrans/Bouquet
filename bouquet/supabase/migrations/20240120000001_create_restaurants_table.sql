-- Crear tabla de restaurantes
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  qr_code TEXT,
  lobby_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_lobby_enabled ON restaurants(lobby_enabled);

-- Habilitar RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Restaurants are viewable by everyone" ON restaurants
  FOR SELECT USING (true);

CREATE POLICY "Restaurants can be managed by authenticated users" ON restaurants
  FOR ALL USING (auth.role() = 'authenticated');

-- Insertar restaurante de ejemplo
INSERT INTO restaurants (slug, name, description, qr_code, lobby_enabled)
VALUES (
  'bouquet',
  'Bouquet Restaurant',
  'Experiencia gastronómica única con sabores auténticos',
  'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=restaurant%20qr%20code%20elegant%20design&image_size=square',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();