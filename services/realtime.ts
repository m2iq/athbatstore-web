import type { Order } from "@/types";
import { supabase } from "./supabase";

type OrderCallback = (order: Order) => void;

// ─── Subscribe to user's order updates (status changes & admin replies) ────

export function subscribeToUserOrders(userId: string, onUpdate: OrderCallback) {
  const channel = supabase
    .channel(`user-orders-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onUpdate(payload.new as Order);
      },
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "orders",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onUpdate(payload.new as Order);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── Subscribe to ALL order changes (for admin dashboard) ──────────────────

export function subscribeToAllOrders(
  onInsert: OrderCallback,
  onUpdate: OrderCallback,
) {
  const channel = supabase
    .channel("admin-orders")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "orders",
      },
      (payload) => {
        onInsert(payload.new as Order);
      },
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "orders",
      },
      (payload) => {
        onUpdate(payload.new as Order);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── Mark admin reply as read ──────────────────────────────────────────────

export async function markReplyAsRead(orderId: string): Promise<void> {
  await supabase
    .from("orders")
    .update({ reply_read_at: new Date().toISOString() })
    .eq("id", orderId);
}

// ─── Get unread reply count ────────────────────────────────────────────────

export async function getUnreadReplyCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .not("admin_reply", "is", null)
    .is("reply_read_at", null);

  return count ?? 0;
}
