-- Migration 006: Digital Store Restructure
-- Description: Simplify for digital-only store. Remove stock/quantity/original_price.
--              Add admin_reply and reply_read_at to orders. Change default status to pending.
--              Remove cancelled/refunded statuses. Add realtime for orders.
-- Date: 2026-02-15

-- ============================================================
-- 1. SIMPLIFY PRODUCTS TABLE
-- ============================================================

-- Remove stock-related columns
ALTER TABLE products DROP COLUMN IF EXISTS stock;
ALTER TABLE products DROP COLUMN IF EXISTS original_price;
ALTER TABLE products DROP COLUMN IF EXISTS is_featured;
ALTER TABLE products DROP COLUMN IF EXISTS filter_tag;

-- ============================================================
-- 2. UPDATE ORDERS TABLE
-- ============================================================

-- Add admin_reply and reply tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_reply TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS reply_read_at TIMESTAMPTZ;

-- Remove quantity default (always 1 for digital)
-- Update status constraint to only allow pending/completed
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'completed'));

-- Change default status to pending (digital items need admin processing)
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE orders ALTER COLUMN quantity SET DEFAULT 1;

-- Update any existing cancelled/refunded orders to completed
UPDATE orders SET status = 'completed' WHERE status IN ('cancelled', 'refunded');

-- ============================================================
-- 3. UPDATED PURCHASE FUNCTION (No stock check, status = pending)
-- ============================================================

CREATE OR REPLACE FUNCTION purchase_product(
  p_user_id UUID,
  p_product_id UUID,
  p_quantity INTEGER DEFAULT 1
)
RETURNS JSON AS $$
DECLARE
  v_product RECORD;
  v_balance NUMERIC(12,2);
  v_total NUMERIC(12,2);
  v_new_balance NUMERIC(12,2);
  v_order_id UUID;
  v_tx_id UUID;
BEGIN
  -- Lock user row
  SELECT wallet_balance INTO v_balance
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'USER_NOT_FOUND');
  END IF;

  -- Get product (no stock check needed for digital)
  SELECT id, name_ar, price, currency, is_active
  INTO v_product
  FROM products
  WHERE id = p_product_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'PRODUCT_NOT_FOUND');
  END IF;

  IF NOT v_product.is_active THEN
    RETURN json_build_object('success', false, 'error', 'PRODUCT_INACTIVE');
  END IF;

  v_total := v_product.price * p_quantity;

  IF v_balance < v_total THEN
    RETURN json_build_object('success', false, 'error', 'INSUFFICIENT_BALANCE');
  END IF;

  v_new_balance := v_balance - v_total;

  -- Deduct balance
  UPDATE profiles SET wallet_balance = v_new_balance, updated_at = NOW()
  WHERE id = p_user_id;

  -- Create order with status 'pending' (admin needs to process)
  INSERT INTO orders (user_id, product_id, product_name, product_price, quantity, total_amount, currency, status, payment_method)
  VALUES (p_user_id, p_product_id, v_product.name_ar, v_product.price, p_quantity, v_total, v_product.currency, 'pending', 'wallet')
  RETURNING id INTO v_order_id;

  -- Log wallet transaction
  INSERT INTO wallet_transactions (user_id, type, amount, balance_after, reference_type, reference_id, description)
  VALUES (p_user_id, 'debit', v_total, v_new_balance, 'purchase', v_order_id::TEXT, 'شراء: ' || v_product.name_ar)
  RETURNING id INTO v_tx_id;

  -- Update order with transaction ID
  UPDATE orders SET transaction_id = v_tx_id WHERE id = v_order_id;

  RETURN json_build_object(
    'success', true,
    'order_id', v_order_id,
    'transaction_id', v_tx_id,
    'total', v_total,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 4. RLS POLICIES FOR ADMIN REPLY
-- ============================================================

-- Allow users to read admin_reply on their own orders (already covered by existing SELECT policy)
-- Allow users to update reply_read_at on their own orders
CREATE POLICY "Users can mark reply as read" ON orders
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 5. ENSURE REALTIME IS ENABLED
-- ============================================================

-- Orders realtime (for both admin and user)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;
END $$;
