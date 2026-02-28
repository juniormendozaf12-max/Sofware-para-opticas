-- ══════════════════════════════════════════════════════════
-- Centro Optico Sicuani — Esquema Supabase
-- ══════════════════════════════════════════════════════════
-- INSTRUCCIONES:
-- 1. Ir a tu Dashboard de Supabase → SQL Editor
-- 2. Pegar TODO este archivo y ejecutar
-- 3. Verificar que la tabla "app_data" aparezca en Table Editor
-- ══════════════════════════════════════════════════════════

-- Tabla principal: almacena TODOS los datos de la app
-- Cada fila = 1 key de localStorage (ej: ventas, clientes, productos)
CREATE TABLE IF NOT EXISTS app_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establecimiento TEXT NOT NULL,
  data_key TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(establecimiento, data_key)
);

-- Indice para busquedas rapidas por establecimiento
CREATE INDEX IF NOT EXISTS idx_app_data_establecimiento
  ON app_data(establecimiento);

-- Indice para busquedas por key
CREATE INDEX IF NOT EXISTS idx_app_data_key
  ON app_data(data_key);

-- Trigger para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_timestamp
  BEFORE UPDATE ON app_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Habilitar Realtime para sincronizacion entre sucursales
ALTER PUBLICATION supabase_realtime ADD TABLE app_data;

-- Row Level Security (permitir acceso con anon key)
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

-- Politica: permitir todo acceso (la app maneja su propia auth)
CREATE POLICY "allow_all_access" ON app_data
  FOR ALL USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════
-- VERIFICACION: Ejecutar esto para confirmar que todo funciona
-- ══════════════════════════════════════════════════════════
-- SELECT * FROM app_data LIMIT 5;
