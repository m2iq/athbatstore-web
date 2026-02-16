import type { Profile } from "@/types";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// ─── Auth ───────────────────────────────────────────────────────────────────

export async function signUp(
  email: string,
  password: string,
  fullName: string,
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

// ─── Profile ────────────────────────────────────────────────────────────────

/**
 * Load profile for a given user. If no profile exists (e.g. first Google OAuth login),
 * creates one via upsert. This avoids depending on database triggers.
 *
 * @param user - The authenticated user object (from session.user)
 *               If not provided, falls back to supabase.auth.getUser()
 */
export async function getProfile(user?: User | null): Promise<Profile | null> {
  // If no user passed, fall back to getUser()
  if (!user) {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    user = currentUser;
  }
  if (!user) return null;

  // Try to fetch existing profile
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (data) return data as Profile;

  // Profile doesn't exist — create via upsert (handles race conditions)
  if (!data && (!error || error.code === "PGRST116")) {
    const { data: newProfile, error: upsertError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          full_name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "",
          phone: user.phone || null,
          avatar_url: user.user_metadata?.avatar_url || null,
        },
        { onConflict: "id" },
      )
      .select()
      .single();

    if (upsertError) {
      console.error("Failed to upsert profile:", upsertError);
      throw upsertError;
    }
    return newProfile as Profile;
  }

  if (error) throw error;
  return null;
}

/**
 * Ensure a profile exists for the given user. Uses upsert to handle
 * concurrent calls safely (e.g. from onAuthStateChange + initialize).
 */
export async function ensureProfile(user: User): Promise<Profile> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing as Profile;

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "",
        phone: user.phone || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      },
      { onConflict: "id" },
    )
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(
  updates: Partial<Pick<Profile, "full_name" | "phone">> & {
    avatar_url?: string | null;
  },
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  return data;
}
