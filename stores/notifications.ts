import {
    getUnreadReplyCount,
    subscribeToUserOrders,
} from "@/services/realtime";
import type { Order } from "@/types";
import { create } from "zustand";

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  decrementUnread: () => void;
  resetUnread: () => void;
  loadUnreadCount: (userId: string) => Promise<void>;
  startListening: (userId: string) => () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  unreadCount: 0,

  setUnreadCount: (count) => set({ unreadCount: count }),

  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  decrementUnread: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  resetUnread: () => set({ unreadCount: 0 }),

  loadUnreadCount: async (userId: string) => {
    const count = await getUnreadReplyCount(userId);
    set({ unreadCount: count });
  },

  startListening: (userId: string) => {
    const unsubscribe = subscribeToUserOrders(userId, (order: Order) => {
      // If admin just replied (admin_reply set but not read yet)
      if (order.admin_reply && !order.reply_read_at) {
        get().incrementUnread();
      }
    });

    return unsubscribe;
  },
}));
