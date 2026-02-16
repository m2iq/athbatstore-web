import { FontSize, FontWeight, Radius, Spacing } from "@/constants/layout";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Ionicons } from "@expo/vector-icons";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    Animated,
    Dimensions,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ─── Types ──────────────────────────────────────────────────────────────────

interface AlertButton {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void | Promise<void>;
}

interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  icon?: "success" | "error" | "warning" | "info" | "confirm";
}

interface AlertContextValue {
  alert: (config: AlertConfig) => void;
}

// ─── Context ────────────────────────────────────────────────────────────────

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export function useAlert(): AlertContextValue {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return ctx;
}

// ─── Icon Map ───────────────────────────────────────────────────────────────

const ICON_MAP: Record<
  string,
  { name: keyof typeof Ionicons.glyphMap; color: string; bg: string }
> = {
  success: { name: "checkmark-circle", color: "#10B981", bg: "#D1FAE5" },
  error: { name: "close-circle", color: "#EF4444", bg: "#FEE2E2" },
  warning: { name: "warning", color: "#F59E0B", bg: "#FEF3C7" },
  info: { name: "information-circle", color: "#3B82F6", bg: "#DBEAFE" },
  confirm: { name: "help-circle", color: "#6366F1", bg: "#E0E7FF" },
};

// ─── Provider ───────────────────────────────────────────────────────────────

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AlertConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const theme = useAppTheme();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const showAlert = useCallback((cfg: AlertConfig) => {
    setConfig(cfg);
    setVisible(true);
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 20,
          stiffness: 300,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

  const hideAlert = useCallback(
    (onPress?: () => void | Promise<void>) => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]).start(async () => {
        setVisible(false);
        setConfig(null);
        if (onPress) {
          await onPress();
        }
      });
    },
    [scaleAnim, opacityAnim],
  );

  const buttons = config?.buttons ?? [{ text: "حسناً", style: "default" }];
  const icon = config?.icon
    ? ICON_MAP[config.icon]
    : buttons.some((b) => b.style === "destructive")
      ? ICON_MAP.warning
      : undefined;

  const { width } = Dimensions.get("window");
  const isWide = width > 600;

  return (
    <AlertContext.Provider value={{ alert: showAlert }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => hideAlert()}
      >
        <Pressable style={styles.overlay} onPress={() => hideAlert()}>
          <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]} />
          <Animated.View
            style={[
              styles.alertBox,
              {
                backgroundColor: theme.surface,
                maxWidth: isWide ? 420 : width - 48,
                transform: [
                  {
                    scale: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.85, 1],
                    }),
                  },
                ],
                opacity: opacityAnim,
              },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              {/* Icon */}
              {icon && (
                <View
                  style={[styles.iconContainer, { backgroundColor: icon.bg }]}
                >
                  <Ionicons name={icon.name} size={32} color={icon.color} />
                </View>
              )}

              {/* Title */}
              {config?.title && (
                <Text style={[styles.title, { color: theme.text }]}>
                  {config.title}
                </Text>
              )}

              {/* Message */}
              {config?.message && (
                <Text
                  style={[styles.message, { color: theme.textSecondary }]}
                  selectable
                >
                  {config.message}
                </Text>
              )}

              {/* Buttons */}
              <View
                style={[
                  styles.buttonsContainer,
                  buttons.length === 1 && styles.singleButton,
                ]}
              >
                {buttons.map((btn, idx) => {
                  const isDestructive = btn.style === "destructive";
                  const isCancel = btn.style === "cancel";
                  const isPrimary = !isCancel && !isDestructive;

                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => hideAlert(btn.onPress)}
                      activeOpacity={0.7}
                      style={[
                        styles.button,
                        isPrimary && {
                          backgroundColor: theme.primary,
                        },
                        isDestructive && {
                          backgroundColor: "#EF4444",
                        },
                        isCancel && {
                          backgroundColor: theme.background,
                          borderWidth: 1,
                          borderColor: theme.border,
                        },
                        buttons.length > 1 && { flex: 1 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          (isPrimary || isDestructive) && {
                            color: "#fff",
                          },
                          isCancel && { color: theme.textSecondary },
                        ]}
                      >
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </AlertContext.Provider>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  alertBox: {
    width: "100%",
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 10,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  message: {
    fontSize: FontSize.body,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  singleButton: {
    justifyContent: "center",
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  buttonText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
  },
});
