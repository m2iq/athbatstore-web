import { useAlert } from "@/components/ui/custom-alert";
import {
    FontSize,
    FontWeight,
    Radius,
    Shadow,
    Spacing,
} from "@/constants/layout";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useResponsive } from "@/hooks/use-responsive";
import { updatePassword, updateProfile } from "@/services/auth";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/stores/auth";
import type { Profile } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const responsive = useResponsive();
  const { profile, refreshProfile } = useAuthStore();
  const { alert } = useAlert();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert({
        title: t("error"),
        message: t("permission_denied"),
        icon: "error",
        buttons: [{ text: t("confirm") }],
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as ImagePicker.MediaTypeOptions,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (!profile) return;
    setUploadingImage(true);

    try {
      // Convert URI to Blob for web, or use file path for native
      const fileName = `${profile.id}-${Date.now()}.jpg`;
      const filePath = fileName;

      let fileToUpload: Blob | File;

      if (Platform.OS === "web") {
        const response = await fetch(uri);
        fileToUpload = await response.blob();
      } else {
        // For React Native, create FormData-compatible file
        const response = await fetch(uri);
        const blob = await response.blob();
        fileToUpload = blob;
      }

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, fileToUpload, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setAvatarError(false);

      alert({
        title: t("success"),
        message: t("image_uploaded"),
        icon: "success",
        buttons: [{ text: t("confirm") }],
      });
    } catch (error) {
      console.error("Image upload error:", error);
      alert({
        title: t("error"),
        message: t("upload_failed"),
        icon: "error",
        buttons: [{ text: t("confirm") }],
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const validate = () => {
    if (!fullName.trim()) {
      alert({
        title: t("error"),
        message: t("name_required"),
        icon: "error",
        buttons: [{ text: t("confirm") }],
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      // Update profile
      const updates: Partial<Pick<Profile, "full_name" | "phone">> & {
        avatar_url?: string | null;
      } = {
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      };

      if (avatarUrl !== profile?.avatar_url) {
        updates.avatar_url = avatarUrl || null;
      }

      console.log("Updating profile with:", updates);
      await updateProfile(updates);
      await refreshProfile();

      alert({
        title: t("success"),
        message: t("profile_updated"),
        icon: "success",
        buttons: [
          {
            text: t("confirm"),
            onPress: () => router.back(),
          },
        ],
      });
    } catch (error) {
      console.error("Profile update error:", error);
      alert({
        title: t("error"),
        message: t("update_failed"),
        icon: "error",
        buttons: [{ text: t("confirm") }],
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      alert({
        title: t("error"),
        message: t("password_min"),
        icon: "error",
        buttons: [{ text: t("confirm") }],
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      alert({
        title: t("error"),
        message: t("passwords_not_match"),
        icon: "error",
        buttons: [{ text: t("confirm") }],
      });
      return;
    }

    setPasswordLoading(true);

    try {
      await updatePassword(newPassword);

      // Close modal first
      setShowPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
      setPasswordLoading(false);

      // Then show alert
      alert({
        title: t("success"),
        message: t("password_updated"),
        icon: "success",
        buttons: [{ text: t("confirm") }],
      });
    } catch (error) {
      console.error("Password update error:", error);
      setPasswordLoading(false);
      alert({
        title: t("error"),
        message: t("password_update_failed"),
        icon: "error",
        buttons: [{ text: t("confirm") }],
      });
    }
  };

  const currentUser = useAuthStore((s) => s.user);
  const hasPassword = currentUser?.app_metadata?.provider !== "google";

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[theme.navy, theme.navyDark] as [string, string]}
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.md, alignItems: "center" },
        ]}
      >
        <View
          style={[
            styles.headerRow,
            {
              maxWidth: responsive.isDesktop
                ? responsive.maxContentWidth
                : undefined,
              width: "100%",
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("edit_profile")}</Text>
          <View style={styles.backButton} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.content}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: responsive.contentPadding,
              maxWidth: responsive.isDesktop ? 700 : undefined,
              width: "100%",
              alignSelf: "center",
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              {avatarUrl && !avatarError ? (
                <Image
                  source={{ uri: avatarUrl, cache: "force-cache" }}
                  style={styles.avatarImage}
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: `${theme.primary}20` },
                  ]}
                >
                  <Ionicons name="person" size={48} color={theme.primary} />
                </View>
              )}
              <TouchableOpacity
                onPress={pickImage}
                disabled={uploadingImage}
                style={[
                  styles.avatarButton,
                  { backgroundColor: theme.primary },
                ]}
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="camera" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={[styles.avatarHint, { color: theme.textSecondary }]}>
              {t("tap_to_change_photo")}
            </Text>
          </View>

          {/* Form Card */}
          <View
            style={[
              styles.formCard,
              { backgroundColor: theme.surface },
              Shadow.lg,
            ]}
          >
            {/* Email (Read-only) */}
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
                    opacity: 0.6,
                  },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={theme.placeholder}
                />
                <Text
                  style={[styles.inputText, { color: theme.textSecondary }]}
                  numberOfLines={1}
                >
                  {currentUser?.email || ""}
                </Text>
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color={theme.placeholder}
                />
              </View>
            </View>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
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

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                {t("phone")}
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
                  name="call-outline"
                  size={20}
                  color={theme.placeholder}
                />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  style={[styles.input, { color: theme.text }]}
                  placeholderTextColor={theme.placeholder}
                  placeholder={t("phone_optional")}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Change Password Button */}
            <View style={styles.divider} />
            <TouchableOpacity
              onPress={() => setShowPasswordModal(true)}
              style={[
                styles.changePasswordButton,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                },
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.changePasswordContent}>
                <View
                  style={[
                    styles.passwordIcon,
                    { backgroundColor: `${theme.error}15` },
                  ]}
                >
                  <Ionicons name="key-outline" size={20} color={theme.error} />
                </View>
                <View style={styles.changePasswordText}>
                  <Text
                    style={[styles.changePasswordTitle, { color: theme.text }]}
                  >
                    {hasPassword ? t("change_password") : t("create_password")}
                  </Text>
                  <Text
                    style={[
                      styles.changePasswordHint,
                      { color: theme.textTertiary },
                    ]}
                  >
                    {hasPassword
                      ? t("change_password_hint")
                      : t("create_password_hint")}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={theme.textTertiary}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
            style={styles.saveButtonWrapper}
          >
            <LinearGradient
              colors={theme.gradientCTA as unknown as [string, string]}
              style={styles.saveButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>{t("save")}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.surface },
              Shadow.lg,
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View
                style={[
                  styles.modalIconContainer,
                  { backgroundColor: `${theme.error}15` },
                ]}
              >
                <Ionicons name="key" size={24} color={theme.error} />
              </View>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {hasPassword ? t("change_password") : t("create_password")}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowPasswordModal(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* New Password */}
            <View style={styles.modalInputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                {t("new_password")}
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
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={[styles.input, { color: theme.text }]}
                  placeholderTextColor={theme.placeholder}
                  placeholder={t("new_password")}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
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

            {/* Confirm Password */}
            <View style={styles.modalInputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                {t("confirm_password")}
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
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={[styles.input, { color: theme.text }]}
                  placeholderTextColor={theme.placeholder}
                  placeholder={t("confirm_password")}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={20}
                    color={theme.placeholder}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handlePasswordChange}
              disabled={
                passwordLoading ||
                newPassword.length < 6 ||
                newPassword !== confirmPassword
              }
              activeOpacity={0.8}
              style={styles.modalSaveButtonWrapper}
            >
              <LinearGradient
                colors={
                  passwordLoading ||
                  newPassword.length < 6 ||
                  newPassword !== confirmPassword
                    ? ["#9CA3AF", "#9CA3AF"]
                    : (theme.gradientCTA as unknown as [string, string])
                }
                style={styles.modalSaveButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {passwordLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSaveButtonText}>{t("save")}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    color: "#fff",
  },
  content: { flex: 1 },
  scrollContent: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.massive,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: Radius.full,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarHint: {
    fontSize: FontSize.small,
    marginTop: Spacing.sm,
  },
  formCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    marginBottom: Spacing.lg,
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
  inputText: {
    flex: 1,
    fontSize: FontSize.body,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginVertical: Spacing.lg,
  },
  changePasswordButton: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
  },
  changePasswordContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  passwordIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  changePasswordText: {
    flex: 1,
  },
  changePasswordTitle: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.semibold,
    marginBottom: 2,
  },
  changePasswordHint: {
    fontSize: FontSize.small,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  sectionHint: {
    fontSize: FontSize.small,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  saveButtonWrapper: {
    marginTop: Spacing.lg,
  },
  saveButton: {
    height: 52,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    textAlign: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: -8,
    left: -8,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  modalInputGroup: {
    marginBottom: Spacing.lg,
  },
  modalSaveButtonWrapper: {
    marginTop: Spacing.md,
  },
  modalSaveButton: {
    height: 52,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveButtonText: {
    color: "#fff",
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.bold,
  },
});
