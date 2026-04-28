-- ══════════════════════════════════════════════════════════
-- OPTICAL ATELIER — Supabase Database Schema
-- Base de datos independiente para el app movil
-- ══════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PATIENTS ──
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  dni TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  birth_date DATE,
  is_vip BOOLEAN DEFAULT false,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_patients_dni ON patients(dni);
CREATE INDEX idx_patients_name ON patients(name);

-- ── CONSULTATIONS ──
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason TEXT NOT NULL,
  medical_history TEXT,
  visual_acuity JSONB,
  diagnosis JSONB NOT NULL DEFAULT '{"myopia":false,"hyperopia":false,"astigmatism":false,"presbyopia":false,"amblyopia":false}',
  diagnosis_tags TEXT[] DEFAULT '{}',
  lens_recommendation JSONB,
  pio_od NUMERIC,
  pio_oi NUMERIC,
  notes TEXT,
  optometrist TEXT,
  ai_analysis TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_consultations_patient ON consultations(patient_id);
CREATE INDEX idx_consultations_date ON consultations(date DESC);

-- ── PRESCRIPTIONS (RX) ──
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  od_sph NUMERIC NOT NULL DEFAULT 0,
  od_cyl NUMERIC NOT NULL DEFAULT 0,
  od_axis INTEGER NOT NULL DEFAULT 0,
  od_add NUMERIC NOT NULL DEFAULT 0,
  oi_sph NUMERIC NOT NULL DEFAULT 0,
  oi_cyl NUMERIC NOT NULL DEFAULT 0,
  oi_axis INTEGER NOT NULL DEFAULT 0,
  oi_add NUMERIC NOT NULL DEFAULT 0,
  dip NUMERIC NOT NULL DEFAULT 60,
  lens_type TEXT,
  material TEXT,
  treatments TEXT[],
  optometrist TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_date ON prescriptions(date DESC);

-- ── PRODUCTS ──
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  color TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  material TEXT,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  sale_price NUMERIC NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  stock_min INTEGER NOT NULL DEFAULT 5,
  supplier TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);

-- ── SALES ──
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  patient_id UUID REFERENCES patients(id),
  patient_name TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  igv NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  document_type TEXT NOT NULL DEFAULT 'boleta',
  document_number TEXT,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sales_date ON sales(date DESC);
CREATE INDEX idx_sales_status ON sales(status);

-- ── LENS INVENTORY (Matrix) ──
CREATE TABLE lens_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material TEXT NOT NULL,
  sph NUMERIC NOT NULL,
  cyl NUMERIC NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(material, sph, cyl)
);

CREATE INDEX idx_lens_material ON lens_inventory(material);

-- ── AUTO-UPDATE updated_at ──
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER lens_inventory_updated_at
  BEFORE UPDATE ON lens_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── ROW LEVEL SECURITY ──
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE lens_inventory ENABLE ROW LEVEL SECURITY;

-- Public read/write access (app uses Firebase Auth, Supabase is data-only)
CREATE POLICY "Allow all" ON patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON consultations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON prescriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON lens_inventory FOR ALL USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════
-- REALTIME — Enable for app_data table (used by desktop + mobile)
-- Run this in the Supabase SQL Editor to enable real-time updates:
-- ══════════════════════════════════════════════════════════

-- Enable RLS on app_data (if not already)
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all app_data" ON app_data FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime on app_data for live sync between desktop and mobile
ALTER PUBLICATION supabase_realtime ADD TABLE app_data;
