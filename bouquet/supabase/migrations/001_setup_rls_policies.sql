-- Enable RLS policies for public access to restaurants table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to restaurants" ON restaurants;
DROP POLICY IF EXISTS "Allow public read access to staff_codes" ON staff_codes;
DROP POLICY IF EXISTS "Allow public read access to tables" ON tables;
DROP POLICY IF EXISTS "Allow public insert to tables" ON tables;
DROP POLICY IF EXISTS "Allow public update to tables" ON tables;

-- Create policies for restaurants table (read-only public access)
CREATE POLICY "Allow public read access to restaurants"
  ON restaurants
  FOR SELECT
  TO public
  USING (true);

-- Create policies for staff_codes table (read-only public access)
CREATE POLICY "Allow public read access to staff_codes"
  ON staff_codes
  FOR SELECT
  TO public
  USING (true);

-- Create policies for tables (full public access for demo purposes)
CREATE POLICY "Allow public read access to tables"
  ON tables
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to tables"
  ON tables
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to tables"
  ON tables
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON restaurants TO anon, authenticated;
GRANT SELECT ON staff_codes TO anon, authenticated;
GRANT ALL PRIVILEGES ON tables TO anon, authenticated;

-- Insert demo restaurant if it doesn't exist
INSERT INTO restaurants (slug, name, description, image, lobby_enabled)
VALUES (
  'demo',
  'Restaurante Demo',
  'Un restaurante de demostración para probar la aplicación Bouquet',
  'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20restaurant%20interior%20elegant%20dining%20room%20warm%20lighting&image_size=landscape_4_3',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- Insert demo staff code if it doesn't exist
INSERT INTO staff_codes (restaurant_id, code, created_by, expires_at)
SELECT 
  r.id,
  'DEMO123',
  'system',
  NOW() + INTERVAL '1 year'
FROM restaurants r
WHERE r.slug = 'demo'
ON CONFLICT DO NOTHING;