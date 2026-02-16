import type {
  Order,
  PurchaseResult,
  RedeemResult,
  WalletTransaction,
} from "@/types";
import { createHash } from "@/utils/crypto";
import { supabase } from "./supabase";

// ─── Wallet Balance ─────────────────────────────────────────────────────────

export async function getWalletBalance(): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .select("wallet_balance")
    .eq("id", user.id)
    .maybeSingle();
  if (error && error.code !== "PGRST116") throw error;
  return Number(data?.wallet_balance ?? 0);
}

// ─── Wallet Transactions ───────────────────────────────────────────────────

export async function getWalletTransactions(
  limit = 50,
  offset = 0,
): Promise<WalletTransaction[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return (data ?? []) as WalletTransaction[];
}

// ─── Redeem Recharge Code ──────────────────────────────────────────────────

export async function redeemCode(code: string): Promise<RedeemResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Ensure profile exists
  await ensureProfile(user.id);

  const normalized = code.trim().toUpperCase().replace(/[-\s]/g, "");
  const codeHash = await createHash(normalized);

  const { data, error } = await supabase.rpc("redeem_recharge_code", {
    p_user_id: user.id,
    p_code_hash: codeHash,
  });
  if (error) throw error;
  return data as RedeemResult;
}

// ─── Purchase Product (Digital — no quantity) ──────────────────────────────

export async function purchaseProduct(
  productId: string,
): Promise<PurchaseResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await ensureProfile(user.id);

  const { data, error } = await supabase.rpc("purchase_product", {
    p_user_id: user.id,
    p_product_id: productId,
    p_quantity: 1,
  });

  if (error) throw error;
  return data as PurchaseResult;
}

// ─── Orders ────────────────────────────────────────────────────────────────

export async function getOrders(limit = 50, offset = 0): Promise<Order[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Order | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

async function ensureProfile(userId: string): Promise<void> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("profiles").insert({
      id: userId,
      full_name:
        user?.user_metadata?.full_name || user?.email?.split("@")[0] || "",
      phone: user?.phone || null,
    });
  }
}
