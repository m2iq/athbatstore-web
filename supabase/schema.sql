-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Athbat Store — Simplified Supabase Database Schema               ║
-- ║  Catalog-only (Categories + Products) with WhatsApp ordering      ║
-- ║  Run this migration in your Supabase SQL Editor.                  ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Categories ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en        TEXT NOT NULL,
  name_ar        TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  icon           TEXT DEFAULT '📦',
  image_url      TEXT,
  sort_order     INT DEFAULT 0,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Products ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id    UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name_en        TEXT NOT NULL,
  name_ar        TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  price          NUMERIC(10,2) NOT NULL DEFAULT 0,
  original_price NUMERIC(10,2),
  currency       TEXT DEFAULT 'IQD',
  image_url      TEXT,
  icon           TEXT DEFAULT '🛒',
  stock          INT DEFAULT 0,
  is_active      BOOLEAN DEFAULT TRUE,
  is_featured    BOOLEAN DEFAULT FALSE,
  metadata       JSONB,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category  ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active    ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured  ON products(is_featured);

-- ─── Row Level Security (RLS) ──────────────────────────────────────────

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products   ENABLE ROW LEVEL SECURITY;

-- Public read access (no authentication required)
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read products"   ON products   FOR SELECT USING (true);

-- ─── Enable Realtime ───────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
