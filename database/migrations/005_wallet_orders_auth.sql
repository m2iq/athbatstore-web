-- Migration 005: Wallet System, Orders, Recharge Codes, User Profiles
-- Description: Transform from WhatsApp ordering to wallet-based purchasing platform
-- Date: 2026-02-14

-- ============================================================
-- 1. PROFILES TABLE (Extends Supabase Auth)
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  wallet_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00
    CONSTRAINT positive_balance CHECK (wallet_balance >= 0),
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. WALLET TRANSACTIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  balance_after NUMERIC(12,2) NOT NULL,
  reference_type TEXT NOT NULL CHECK (reference_type IN ('recharge', 'purchase', 'refund', 'admin_adjustment')),
  reference_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_created ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_ref ON wallet_transactions(reference_type, reference_id);

-- ============================================================
-- 3. RECHARGE CODES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS recharge_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash TEXT NOT NULL UNIQUE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  used_by UUID REFERENCES profiles(id),
  used_at TIMESTAMPTZ,
  batch_id TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recharge_code_hash ON recharge_codes(code_hash);
CREATE INDEX IF NOT EXISTS idx_recharge_codes_batch ON recharge_codes(batch_id);
CREATE INDEX IF NOT EXISTS idx_recharge_codes_used ON recharge_codes(is_used);

-- ============================================================
-- 4. ORDERS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_price NUMERIC(12,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  total_amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IQD',
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  payment_method TEXT NOT NULL DEFAULT 'wallet',
  transaction_id UUID REFERENCES wallet_transactions(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(product_id);

-- ============================================================
-- 5. ATOMIC PURCHASE FUNCTION (Prevents race conditions)
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
  -- Lock user row to prevent concurrent purchases
  SELECT wallet_balance INTO v_balance
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'USER_NOT_FOUND');
  END IF;

  -- Lock and get product
  SELECT id, name_ar, price, currency, stock, is_active
  INTO v_product
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'PRODUCT_NOT_FOUND');
  END IF;

  IF NOT v_product.is_active THEN
    RETURN json_build_object('success', false, 'error', 'PRODUCT_INACTIVE');
  END IF;

  IF v_product.stock < p_quantity THEN
    RETURN json_build_object('success', false, 'error', 'INSUFFICIENT_STOCK');
  END IF;

  v_total := v_product.price * p_quantity;

  IF v_balance < v_total THEN
    RETURN json_build_object('success', false, 'error', 'INSUFFICIENT_BALANCE');
  END IF;

  v_new_balance := v_balance - v_total;

  -- Deduct balance
  UPDATE profiles SET wallet_balance = v_new_balance, updated_at = NOW()
  WHERE id = p_user_id;

  -- Create order
  INSERT INTO orders (user_id, product_id, product_name, product_price, quantity, total_amount, currency, status, payment_method)
  VALUES (p_user_id, p_product_id, v_product.name_ar, v_product.price, p_quantity, v_total, v_product.currency, 'completed', 'wallet')
  RETURNING id INTO v_order_id;

  -- Log wallet transaction
  INSERT INTO wallet_transactions (user_id, type, amount, balance_after, reference_type, reference_id, description)
  VALUES (p_user_id, 'debit', v_total, v_new_balance, 'purchase', v_order_id::TEXT, 'شراء: ' || v_product.name_ar)
  RETURNING id INTO v_tx_id;

  -- Update order with transaction ID
  UPDATE orders SET transaction_id = v_tx_id WHERE id = v_order_id;

  -- Reduce stock
  UPDATE products SET stock = stock - p_quantity, updated_at = NOW()
  WHERE id = p_product_id;

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
-- 6. ATOMIC RECHARGE FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION redeem_recharge_code(
  p_user_id UUID,
  p_code_hash TEXT
)
RETURNS JSON AS $$
DECLARE
  v_code RECORD;
  v_balance NUMERIC(12,2);
  v_new_balance NUMERIC(12,2);
  v_tx_id UUID;
BEGIN
  -- Lock user
  SELECT wallet_balance INTO v_balance
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'USER_NOT_FOUND');
  END IF;

  -- Lock recharge code
  SELECT id, amount, is_used, expires_at
  INTO v_code
  FROM recharge_codes
  WHERE code_hash = p_code_hash
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'INVALID_CODE');
  END IF;

  IF v_code.is_used THEN
    RETURN json_build_object('success', false, 'error', 'CODE_ALREADY_USED');
  END IF;

  IF v_code.expires_at IS NOT NULL AND v_code.expires_at < NOW() THEN
    RETURN json_build_object('success', false, 'error', 'CODE_EXPIRED');
  END IF;

  v_new_balance := v_balance + v_code.amount;

  -- Credit balance
  UPDATE profiles SET wallet_balance = v_new_balance, updated_at = NOW()
  WHERE id = p_user_id;

  -- Mark code as used
  UPDATE recharge_codes SET is_used = true, used_by = p_user_id, used_at = NOW()
  WHERE id = v_code.id;

  -- Log transaction
  INSERT INTO wallet_transactions (user_id, type, amount, balance_after, reference_type, reference_id, description)
  VALUES (p_user_id, 'credit', v_code.amount, v_new_balance, 'recharge', v_code.id::TEXT, 'شحن رصيد')
  RETURNING id INTO v_tx_id;

  RETURN json_build_object(
    'success', true,
    'amount', v_code.amount,
    'new_balance', v_new_balance,
    'transaction_id', v_tx_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recharge_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read/update their own
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Wallet transactions: Users can only view their own
CREATE POLICY "Users can view own transactions" ON wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Recharge codes: No direct user access (only through RPC)
-- No SELECT policy for users — they use the redeem function

-- Orders: Users can only view their own
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Service role (admin) bypasses RLS automatically

-- ============================================================
-- 8. REALTIME
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE wallet_transactions;
