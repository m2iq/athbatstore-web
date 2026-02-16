-- Migration: Replace subcategories with product filter_tag
-- Date: 2026-02-13
-- Description: Remove subcategories table. Add filter_tag column to products.
--              Filters are now auto-derived from distinct product filter_tag values per category.

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. ADD filter_tag TO PRODUCTS
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE products
ADD COLUMN IF NOT EXISTS filter_tag TEXT DEFAULT NULL;

-- Index for fast distinct lookups per category
CREATE INDEX IF NOT EXISTS idx_products_filter_tag ON products(category_id, filter_tag);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. MIGRATE DATA: Copy subcategory names into filter_tag
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE products p
SET filter_tag = s.name_ar
FROM subcategories s
WHERE p.subcategory_id = s.id
  AND p.subcategory_id IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. DROP subcategory_id COLUMN FROM PRODUCTS
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE products DROP COLUMN IF EXISTS subcategory_id;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. DROP SUBCATEGORIES TABLE
-- ═══════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS subcategories CASCADE;
