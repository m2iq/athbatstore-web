-- Migration: Remove English fields from database schema (Arabic-first app)
-- Date: 2026-02-13
-- Description: Remove name_en, description_en fields to keep only Arabic fields

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. BACKUP TABLES (Optional but recommended)
-- ═══════════════════════════════════════════════════════════════════════════

-- Create backup of categories table
CREATE TABLE IF NOT EXISTS categories_backup AS 
SELECT * FROM categories;

-- Create backup of products table  
CREATE TABLE IF NOT EXISTS products_backup AS 
SELECT * FROM products;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. REMOVE ENGLISH COLUMNS FROM CATEGORIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop English name column
ALTER TABLE categories 
DROP COLUMN IF EXISTS name_en;

-- Drop English description column
ALTER TABLE categories 
DROP COLUMN IF EXISTS description_en;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. REMOVE ENGLISH COLUMNS FROM PRODUCTS
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop English name column
ALTER TABLE products 
DROP COLUMN IF EXISTS name_en;

-- Drop English description column
ALTER TABLE products 
DROP COLUMN IF EXISTS description_en;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. ADD INDEXES FOR BETTER PERFORMANCE (Arabic fields only)
-- ═══════════════════════════════════════════════════════════════════════════

-- Index for Arabic category name search
CREATE INDEX IF NOT EXISTS idx_categories_name_ar ON categories(name_ar);

-- Index for Arabic product name search (with trigrams for better text search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_products_name_ar_trgm ON products USING gin(name_ar gin_trgm_ops);

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Verify categories table structure
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'categories' ORDER BY ordinal_position;

-- Verify products table structure  
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'products' ORDER BY ordinal_position;

-- Count records (should match backup)
-- SELECT 
--   (SELECT COUNT(*) FROM categories) as categories_count,
--   (SELECT COUNT(*) FROM products) as products_count,
--   (SELECT COUNT(*) FROM categories_backup) as categories_backup_count,
--   (SELECT COUNT(*) FROM products_backup) as products_backup_count;

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. CLEANUP (Run after verifying everything works)
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop backup tables after successful migration
-- DROP TABLE IF EXISTS categories_backup;
-- DROP TABLE IF EXISTS products_backup;
