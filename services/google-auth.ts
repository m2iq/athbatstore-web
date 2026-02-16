import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { supabase } from "./supabase";

// Complete any pending auth sessions (required for web)
if (Platform.OS === "web") {
  WebBrowser.maybeCompleteAuthSession();
}

/**
 * Get the redirect URI for OAuth.
 * On native, we use the Expo Linking URL to the root path.
 * This prevents the "Unmatched Route / Page could not be found" error
 * because we don't send users to a specific route like /auth/callback.
 *
 * IMPORTANT: In Supabase Dashboard → Authentication → URL Configuration:
 *   Add this URL to "Redirect URLs": athbatstore://
 */
export function getRedirectUri(): string {
  // Use the app scheme root URL for all platforms
  return Linking.createURL("/");
}

/**
 * Extract tokens from a callback URL.
 * Handles both hash fragments (#access_token=...) and query params (?access_token=...).
 */
function extractTokensFromUrl(url: string): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  try {
    // Try hash fragment first (Supabase default for implicit flow)
    const hashIndex = url.indexOf("#");
    if (hashIndex !== -1) {
      const hashString = url.substring(hashIndex + 1);
      const hashParams = new URLSearchParams(hashString);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      if (accessToken) return { accessToken, refreshToken };
    }

    // Try query params as fallback
    const queryIndex = url.indexOf("?");
    if (queryIndex !== -1) {
      const queryString = url.substring(queryIndex + 1);
      const queryParams = new URLSearchParams(queryString);
      const accessToken = queryParams.get("access_token");
      const refreshToken = queryParams.get("refresh_token");
      if (accessToken) return { accessToken, refreshToken };
    }
  } catch {
    // Ignore parse errors
  }
  return { accessToken: null, refreshToken: null };
}

/**
 * Full Google Sign-In flow using Supabase OAuth redirect.
 * Flow: App → Google → Supabase callback → App (via deep link)
 */
export async function signInWithGoogleOAuth() {
  const redirectUri = getRedirectUri();
  console.log("Redirect URI:", getRedirectUri());

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error("No OAuth URL returned");

  // Open the OAuth URL in a web browser
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri, {
    showInRecents: true,
    preferEphemeralSession: false,
  });

  if (result.type === "success" && result.url) {
    const { accessToken, refreshToken } = extractTokensFromUrl(result.url);

    if (accessToken) {
      // Set the session in Supabase client
      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken ?? "",
        });

      if (sessionError) throw sessionError;
      return sessionData;
    }

    throw new Error("No access token in redirect URL");
  }

  if (result.type === "cancel" || result.type === "dismiss") {
    throw new Error("GOOGLE_SIGN_IN_CANCELLED");
  }

  throw new Error("Google Sign-In failed");
}
