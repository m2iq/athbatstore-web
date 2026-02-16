# Google Sign-In Setup Guide

## 1. Google Cloud Console Configuration

### Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**

### Create 3 Client IDs:

#### A. Web Client ID

- Application type: **Web application**
- Name: `Athbat Store Web`
- Authorized JavaScript origins:
  - `https://YOUR_SUPABASE_PROJECT.supabase.co`
  - `http://localhost:8081` (for development)
- Authorized redirect URIs:
  - `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
  - `https://auth.expo.io/@YOUR_EXPO_USERNAME/athbat-store`

#### B. Android Client ID

- Application type: **Android**
- Name: `Athbat Store Android`
- Package name: `com.athbat.store`
- SHA-1 certificate fingerprint:

  ```bash
  # Debug keystore
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

  # For Expo (use expo credentials)
  eas credentials
  ```

#### C. iOS Client ID

- Application type: **iOS**
- Name: `Athbat Store iOS`
- Bundle ID: `com.athbat.store`

---

## 2. Supabase Configuration

### Enable Google Provider

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication > Providers**
3. Enable **Google**
4. Enter the **Web Client ID** and **Client Secret** from step 1A
5. Save

### Redirect URLs

Add these to **Authentication > URL Configuration > Redirect URLs**:

```
athbatstore://auth/callback
https://auth.expo.io/@YOUR_EXPO_USERNAME/athbat-store
http://localhost:8081
```

---

## 3. Environment Variables

Add to your `.env` file:

```env
# Existing
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Google OAuth (add these)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxxx.apps.googleusercontent.com
```

> **Note**: The Web Client ID is **required** for all platforms. Android/iOS Client IDs are optional but recommended for production.

---

## 4. How It Works

### OAuth Flow

1. User taps "المتابعة مع Google" button
2. App opens Google OAuth consent screen via `expo-web-browser`
3. User signs in with Google account
4. Google redirects back to app with tokens
5. Supabase exchanges tokens and creates/signs in user
6. Profile is auto-created if it doesn't exist (handled by `getProfile()`)

### Platforms

| Platform | Method                                                        |
| -------- | ------------------------------------------------------------- |
| Android  | `WebBrowser.openAuthSessionAsync` with custom scheme redirect |
| iOS      | `WebBrowser.openAuthSessionAsync` with custom scheme redirect |
| Web      | `WebBrowser.openAuthSessionAsync` + URL session detection     |

### User Data Stored

- `auth.users`: email, user_metadata (full_name, avatar_url, google_id)
- `profiles`: id, full_name, avatar_url (synced from Google account)

---

## 5. Development Testing

### Expo Go

```bash
npx expo start
```

Google Sign-In works in Expo Go using the Expo proxy redirect URI.

### Development Build

```bash
npx expo run:android
npx expo run:ios
```

### Common Issues

| Issue                     | Solution                                      |
| ------------------------- | --------------------------------------------- |
| "redirect_uri_mismatch"   | Add the exact redirect URI to Google Console  |
| Sign-in cancelled         | Normal user behavior, no error shown          |
| No session after redirect | Check `detectSessionInUrl` is enabled for web |
| Android SHA-1 mismatch    | Re-generate SHA-1 and update Google Console   |

---

## 6. Files Modified/Created

| File                                      | Description                                  |
| ----------------------------------------- | -------------------------------------------- |
| `services/google-auth.ts`                 | Google OAuth service (signInWithGoogleOAuth) |
| `components/ui/google-sign-in-button.tsx` | Google button with icon, dark/light mode     |
| `app/login.tsx`                           | Updated with Google Sign-In section          |
| `services/supabase.ts`                    | Enabled detectSessionInUrl for web           |
| `i18n/ar.json`                            | Arabic translations                          |
| `i18n/en.json`                            | English translations                         |
| `i18n/ku.json`                            | Kurdish translations                         |
| `app.json`                                | Added bundleIdentifier & package name        |
