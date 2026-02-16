import GoogleSignInButton from "@/components/ui/google-sign-in-button";
import {
  FontSize,
  FontWeight,
  Radius,
  Shadow,
  Spacing,
} from "@/constants/layout";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useResponsive } from "@/hooks/use-responsive";
import { signIn, signUp } from "@/services/auth";
import { signInWithGoogleOAuth } from "@/services/google-auth";
import { useAuthStore } from "@/stores/auth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const responsive = useResponsive();
  const { blockReason, clearBlockReason } = useAuthStore();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  // Show block message if user was blocked
  useEffect(() => {
    if (blockReason === "account_blocked") {
      setError(t("account_blocked_message"));
      // Clear the block reason after showing it
      const timeout = setTimeout(() => {
        clearBlockReason();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [blockReason, clearBlockReason, t]);

  const validate = () => {
    if (!email.trim()) {
      setError(t("email_required"));
      return false;
    }
    if (!password.trim()) {
      setError(t("password_required"));
      return false;
    }
    if (password.length < 6) {
      setError(t("password_min"));
      return false;
    }
    if (!isLogin && !fullName.trim()) {
      setError(t("name_required"));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    if (!validate()) return;

    // Prevent duplicate submissions (2 second rate limit)
    const now = Date.now();
    if (now - lastSubmitTime < 2000) {
      setError(t("please_wait"));
      return;
    }
    setLastSubmitTime(now);

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email.trim(), password);
      } else {
        // Sign up new user
        const signUpResult = await signUp(
          email.trim(),
          password,
          fullName.trim(),
        );

        // If email confirmation is required and session is not created,
        // automatically sign in the user
        if (!signUpResult.session && signUpResult.user) {
          // Auto sign-in after signup
          await signIn(email.trim(), password);
        }
      }
      // Don't manually navigate - let AuthGuard handle it via onAuthStateChange
      // The session will be updated automatically and AuthGuard will redirect
    } catch (err: unknown) {
      // Check for rate limit error
      const errorMessage = err instanceof Error ? err.message : "";
      if (
        errorMessage.includes("429") ||
        errorMessage.includes("Too Many Requests")
      ) {
        setError(t("too_many_requests_try_again_later"));
      } else {
        setError(isLogin ? t("login_error") : t("signup_error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");

    // Prevent duplicate submissions
    const now = Date.now();
    if (now - lastSubmitTime < 2000) {
      setError(t("please_wait"));
      return;
    }
    setLastSubmitTime(now);

    setGoogleLoading(true);
    try {
      await signInWithGoogleOAuth();
      // Don't manually navigate - let AuthGuard handle it via onAuthStateChange
      // The session will be updated automatically and AuthGuard will redirect
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      // Don't show error if user cancelled
      if (message !== "GOOGLE_SIGN_IN_CANCELLED") {
        // Check for rate limit error
        if (message.includes("429") || message.includes("Too Many Requests")) {
          setError(t("too_many_requests_try_again_later"));
        } else {
          setError(t("google_signin_error"));
        }
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.navy, theme.navyDark] as [string, string]}
        style={[
          styles.headerGradient,
          {
            paddingTop: insets.top + Spacing.xxxl,
            alignItems: "center",
          },
        ]}
      >
        <View
          style={[
            styles.headerContent,
            {
              maxWidth: responsive.isDesktop ? 600 : "100%",
              width: "100%",
              alignItems: "center",
            },
          ]}
        >
          <View style={styles.logoRow}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headerTitle}>{t("app_name")}</Text>
          <Text style={styles.headerSub}>{t("app_tagline")}</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.formContainer}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: responsive.contentPadding,
              maxWidth: responsive.isDesktop ? 600 : undefined,
              width: "100%",
              alignSelf: "center",
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.formCard,
              { backgroundColor: theme.surface },
              Shadow.lg,
            ]}
          >
            <Text style={[styles.formTitle, { color: theme.text }]}>
              {isLogin ? t("login") : t("signup")}
            </Text>
            <Text style={[styles.formSubtitle, { color: theme.textSecondary }]}>
              {isLogin ? t("login_subtitle") : t("signup_subtitle")}
            </Text>

            {error ? (
              <View
                style={[
                  styles.errorBanner,
                  { backgroundColor: theme.errorLight },
                ]}
              >
                <Ionicons name="alert-circle" size={18} color={theme.error} />
                <Text style={[styles.errorText, { color: theme.error }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  {t("full_name")}
                </Text>
                <View
                  style={[
                    styles.inputRow,
                    {
                      borderColor: theme.inputBorder,
                      backgroundColor: theme.inputBackground,
                    },
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={theme.placeholder}
                  />
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    style={[styles.input, { color: theme.text }]}
                    placeholderTextColor={theme.placeholder}
                    placeholder={t("full_name")}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                {t("email")}
              </Text>
              <View
                style={[
                  styles.inputRow,
                  {
                    borderColor: theme.inputBorder,
                    backgroundColor: theme.inputBackground,
                  },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={theme.placeholder}
                />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  style={[styles.input, { color: theme.text }]}
                  placeholderTextColor={theme.placeholder}
                  placeholder={t("email")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                {t("password")}
              </Text>
              <View
                style={[
                  styles.inputRow,
                  {
                    borderColor: theme.inputBorder,
                    backgroundColor: theme.inputBackground,
                  },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={theme.placeholder}
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  style={[styles.input, { color: theme.text }]}
                  placeholderTextColor={theme.placeholder}
                  placeholder={t("password")}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={theme.placeholder}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.gradientCTA as unknown as [string, string]}
                style={styles.submitBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>
                    {isLogin ? t("login") : t("signup")}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* ── Divider ── */}
            <View style={styles.dividerRow}>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: theme.inputBorder },
                ]}
              />
              <Text
                style={[styles.dividerText, { color: theme.textSecondary }]}
              >
                {t("or")}
              </Text>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: theme.inputBorder },
                ]}
              />
            </View>

            {/* ── Google Sign-In ── */}
            <GoogleSignInButton
              onPress={handleGoogleSignIn}
              loading={googleLoading}
              disabled={loading}
            />

            <TouchableOpacity
              onPress={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              style={styles.switchRow}
            >
              <Text style={[styles.switchText, { color: theme.textSecondary }]}>
                {isLogin ? t("no_account") : t("have_account")}{" "}
              </Text>
              <Text style={[styles.switchLink, { color: theme.primary }]}>
                {isLogin ? t("signup") : t("login")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: {
    paddingBottom: Spacing.xxxl,
    alignItems: "center",
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
  },
  headerContent: {
    paddingHorizontal: Spacing.xl,
  },
  logoRow: {
    marginBottom: Spacing.md,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
  },
  headerTitle: {
    fontSize: FontSize.heading,
    fontWeight: FontWeight.bold,
    color: "#fff",
    marginBottom: Spacing.xxs,
  },
  headerSub: {
    fontSize: FontSize.body,
    color: "rgba(255,255,255,0.7)",
  },
  formContainer: { flex: 1 },
  scrollContent: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.massive,
  },
  formCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
  },
  formTitle: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xxs,
  },
  formSubtitle: {
    fontSize: FontSize.body,
    marginBottom: Spacing.xl,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
  },
  errorText: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 52,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.body,
    textAlign: "right",
  },
  submitBtn: {
    height: 52,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
  },
  submitText: {
    color: "#fff",
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.bold,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.medium,
    paddingHorizontal: Spacing.xs,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
  switchText: {
    fontSize: FontSize.body,
  },
  switchLink: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
  },
});
