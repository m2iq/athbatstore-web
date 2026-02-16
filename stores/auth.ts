import { ensureProfile, getProfile } from "@/services/auth";
import { supabase } from "@/services/supabase";
import type { Profile } from "@/types";
import type { Session, User } from "@supabase/supabase-js";
import { Platform } from "react-native";
import { create } from "zustand";

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  initialized: boolean;
  blockReason: string | null;
  initialize: () => Promise<void>;
  setSession: (session: Session | null) => void;
  loadProfile: (user: User) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateBalance: (newBalance: number) => void;
  clearBlockReason: () => void;
  reset: () => void;
}

// Track if onAuthStateChange listener is already set up
let authListenerActive = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  profileLoading: false,
  initialized: false,
  blockReason: null,

  /**
   * Load profile for a user. Uses ensureProfile (upsert) to guarantee
   * a profile exists — especially important for first Google OAuth login.
   * If user is blocked, signs them out immediately.
   */
  loadProfile: async (user: User) => {
    set({ profileLoading: true });
    try {
      const profile = await ensureProfile(user);

      // Check if user is blocked
      if (profile.is_blocked) {
        console.log("[Auth] User is blocked, signing out...");
        set({
          blockReason: "account_blocked",
          profileLoading: false,
        });
        // Sign out will trigger onAuthStateChange -> SIGNED_OUT
        await supabase.auth.signOut();
        return;
      }

      set({ profile, profileLoading: false });
    } catch (error) {
      console.error("Failed to load profile:", error);
      set({ profileLoading: false });
    }
  },

  initialize: async () => {
    // Skip initialization during SSR
    if (Platform.OS === "web" && typeof window === "undefined") {
      set({ loading: false, initialized: true });
      return;
    }

    // Prevent duplicate listeners
    if (authListenerActive) return;
    authListenerActive = true;

    try {
      // 1. Get initial session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Set session immediately so AuthGuard can redirect
        set({
          session,
          user: session.user,
          loading: false,
          initialized: true,
          profileLoading: true,
        });

        // Load profile asynchronously (non-blocking)
        get().loadProfile(session.user);
      } else {
        set({
          session: null,
          user: null,
          profile: null,
          loading: false,
          initialized: true,
        });
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ loading: false, initialized: true });
    }

    // 2. Setup single auth state listener
    supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("[Auth]", event, newSession?.user?.email ?? "no user");

      const currentUserId = get().user?.id;

      if (
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") &&
        newSession?.user
      ) {
        // Always update session & user
        set({
          session: newSession,
          user: newSession.user,
          loading: false,
          initialized: true,
        });

        // Only reload profile if user changed (not on mere token refresh)
        if (event === "SIGNED_IN" && newSession.user.id !== currentUserId) {
          set({ profileLoading: true });
          get().loadProfile(newSession.user);
        }
      } else if (event === "SIGNED_OUT") {
        set({
          session: null,
          user: null,
          profile: null,
          loading: false,
          profileLoading: false,
          initialized: true,
        });
      }
    });
  },

  setSession: (session) => {
    set({ session, user: session?.user ?? null });
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    try {
      const profile = await getProfile(user);
      if (profile) set({ profile });
    } catch {
      // ignore
    }
  },

  updateBalance: (newBalance) => {
    const { profile } = get();
    if (profile) {
      set({ profile: { ...profile, wallet_balance: newBalance } });
    }
  },

  clearBlockReason: () => {
    set({ blockReason: null });
  },

  reset: () => {
    set({
      session: null,
      user: null,
      profile: null,
      loading: false,
      profileLoading: false,
      blockReason: null,
    });
  },
}));
