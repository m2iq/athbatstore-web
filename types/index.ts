// ─── Database Row Types (mirror Supabase schema) ─────────────────────────

export interface Category {
  id: string;
  name_ar: string;
  description_ar: string | null;
  icon: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name_ar: string;
  description_ar: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  icon: string;
  is_active: boolean;
  is_featured: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  wallet_balance: number;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: "credit" | "debit";
  amount: number;
  balance_after: number;
  reference_type: "recharge" | "purchase" | "refund" | "admin_adjustment";
  reference_id: string | null;
  description: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  total_amount: number;
  currency: string;
  status: "pending" | "completed";
  payment_method: "wallet";
  transaction_id: string | null;
  notes: string | null;
  admin_reply: string | null;
  reply_read_at: string | null;
  created_at: string;
  updated_at: string;
  product?: Product;
  profiles?: { full_name: string; phone: string | null } | null;
}

export interface RechargeCode {
  id: string;
  code_hash: string;
  amount: number;
  is_used: boolean;
  used_by: string | null;
  used_at: string | null;
  batch_id: string | null;
  expires_at: string | null;
  created_at: string;
  profile?: Profile;
}

// ─── RPC Response Types ─────────────────────────────────────────────────

export interface PurchaseResult {
  success: boolean;
  error?: string;
  order_id?: string;
  transaction_id?: string;
  total?: number;
  new_balance?: number;
}

export interface RedeemResult {
  success: boolean;
  error?: string;
  amount?: number;
  new_balance?: number;
  transaction_id?: string;
}

// ─── Navigation param helpers ───────────────────────────────────────────

export interface ProductDetailParams {
  productId: string;
}

export interface CategoryProductsParams {
  categoryId: string;
  categoryName: string;
}
