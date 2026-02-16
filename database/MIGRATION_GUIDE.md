# Database Schema Migration Guide

## 🎯 Migration: Remove English Fields (Arabic-First)

This migration removes all English language fields from the database schema, keeping only Arabic fields for a cleaner, minimal schema.

## 📋 Changes

### Categories Table

**Removed columns:**

- `name_en` (English name)
- `description_en` (English description)

**Kept columns:**

- `id`, `name_ar`, `description_ar`, `icon`, `image_url`, `sort_order`, `is_active`, `created_at`, `updated_at`

### Products Table

**Removed columns:**

- `name_en` (English name)
- `description_en` (English description)

**Kept columns:**

- `id`, `category_id`, `name_ar`, `description_ar`, `price`, `original_price`, `currency`, `image_url`, `icon`, `stock`, `is_active`, `is_featured`, `metadata`, `created_at`, `updated_at`

## 🚀 How to Apply Migration

### Option 1: Supabase Dashboard (Recommended)

1. **Login to Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Navigate to SQL Editor in the left sidebar
   - Click "New Query"

3. **Copy Migration Script**
   - Open `database/migrations/002_remove_english_fields.sql`
   - Copy the entire content

4. **Execute Migration**
   - Paste the SQL into the Supabase SQL Editor
   - Review the script carefully
   - Click "Run" to execute

5. **Verify Results**
   - Uncomment and run the verification queries at the end of the migration
   - Check that English columns are removed
   - Verify record counts match backups

### Option 2: Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db push

# Or execute the migration file directly
psql -h YOUR_DB_HOST -U postgres -d postgres -f database/migrations/002_remove_english_fields.sql
```

## ⚠️ Important Notes

### Before Migration

1. **Backup Database**: The migration automatically creates backup tables, but consider doing an additional full backup
2. **Test Environment**: Run this migration in a staging environment first
3. **Downtime**: This migration requires brief downtime (< 1 minute for typical databases)

### After Migration

1. **Verify Application**: Test all features in the mobile app
2. **Admin Panel**: Update admin panel to use only Arabic fields
3. **Search Functionality**: Test product/category search still works
4. **Cleanup**: After confirming everything works, uncomment and run the cleanup section to remove backup tables

## 🔄 Rollback Plan

If you need to rollback this migration:

```sql
-- Restore from backup tables
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS products;

ALTER TABLE categories_backup RENAME TO categories;
ALTER TABLE products_backup RENAME TO products;
```

## ✅ Post-Migration Checklist

- [ ] English columns removed from categories table
- [ ] English columns removed from products table
- [ ] Arabic indexes created successfully
- [ ] Mobile app loads correctly
- [ ] Product search works
- [ ] Category browse works
- [ ] Admin panel updated
- [ ] Backup tables can be safely removed

## 🔗 Related Files Updated

- `/types/index.ts` - TypeScript interfaces updated to remove English fields
- `/services/catalog.ts` - Service layer should already use only Arabic fields
- `/components/*` - UI components already use `name_ar`, `description_ar`

## 📊 Performance Improvements

This migration also adds performance indexes:

- `idx_categories_name_ar` - B-tree index for category name filtering
- `idx_products_name_ar_trgm` - Trigram GIN index for fuzzy product search in Arabic

## 🛟 Support

If you encounter any issues during migration:

1. Check Supabase logs for detailed error messages
2. Verify PostgreSQL version supports `pg_trgm` extension
3. Ensure you have proper permissions to alter tables
4. Contact your database administrator if needed
