-- Migration: Add subcategories table for category filters
-- Date: 2026-02-13
-- Description: Subcategories act as filter chips within each category

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. CREATE SUBCATEGORIES TABLE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS subcategories (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id  UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name_ar      TEXT NOT NULL,
  sort_order   INT DEFAULT 0,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. ADD subcategory_id TO PRODUCTS
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE products
ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. RLS — Public read
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read subcategories" ON subcategories FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. REALTIME
-- ═══════════════════════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE subcategories;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. CREATE STORAGE BUCKET FOR PRODUCT IMAGES
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT DO NOTHING;

-- Allow public read
CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Allow service role to upload
CREATE POLICY "Service upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Service update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'products');

CREATE POLICY "Service delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'products');
