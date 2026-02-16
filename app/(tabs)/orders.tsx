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
import { markReplyAsRead, subscribeToUserOrders } from "@/services/realtime";
import { getOrders } from "@/services/wallet";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notifications";
import type { Order } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STATUS_CONFIG: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }
> = {
  pending: { icon: "time", color: "#F59E0B", bg: "#FEF3C7" },
  completed: { icon: "checkmark-circle", color: "#10B981", bg: "#D1FAE5" },
};

export default function OrdersScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const responsive = useResponsive();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { decrementUnread } = useNotificationStore();
  const { alert: showAlert } = useAlert();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  // Detect if text contains a code-like pattern (numbers, hashes, or formatted codes)
  const extractCode = useCallback((text: string): string | null => {
    // Match patterns like: XXXX-XXXX-XXXX, long numbers (6+), or alphanumeric codes
    const patterns = [
      /[A-Z0-9]{4,}-[A-Z0-9]{4,}(-[A-Z0-9]{4,})*/i, // XXXX-XXXX-XXXX
      /\b[A-Z0-9]{8,}\b/i, // Long alphanumeric
      /\b\d{6,}\b/, // Long numbers
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }
    return null;
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: show the text in an alert for manual copying
      showAlert({
        title: t("copy_code"),
        message: text,
        icon: "info",
      });
    }
  };

  const loadOrders = useCallback(async () => {
    try {
      const data = await getOrders(50, 0);
      setOrders(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Real-time order updates
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToUserOrders(user.id, (updatedOrder) => {
      setOrders((prev) => {
        const exists = prev.find((o) => o.id === updatedOrder.id);
        if (exists) {
          return prev.map((o) =>
            o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o,
          );
        }
        return [updatedOrder, ...prev];
      });
    });

    return unsubscribe;
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handleViewReply = useCallback(
    async (order: Order) => {
      setSelectedOrder(order);
      // Mark as read if unread
      if (order.admin_reply && !order.reply_read_at) {
        await markReplyAsRead(order.id);
        decrementUnread();
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? { ...o, reply_read_at: new Date().toISOString() }
              : o,
          ),
        );
      }
    },
    [decrementUnread],
  );

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat("ar-IQ", { maximumFractionDigits: 0 }).format(
      Number(price),
    );
  }, []);

  const renderOrder = useCallback(
    ({ item }: { item: Order }) => {
      const statusInfo = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
      const hasUnreadReply = item.admin_reply && !item.reply_read_at;
      const date = new Date(item.created_at).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleViewReply(item)}
          style={[
            styles.orderCard,
            { backgroundColor: theme.surface },
            Shadow.sm,
            hasUnreadReply && {
              borderLeftWidth: 3,
              borderLeftColor: "#3B82F6",
            },
          ]}
        >
          {/* Header */}
          <View style={styles.orderHeader}>
            <View style={styles.orderIdRow}>
              <Ionicons
                name="bag-check-outline"
                size={18}
                color={theme.primary}
              />
              <Text
                style={[styles.orderIdText, { color: theme.textSecondary }]}
              >
                #{item.id.slice(0, 8)}
              </Text>
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}
            >
              <Ionicons
                name={statusInfo.icon}
                size={14}
                color={statusInfo.color}
              />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {item.status === "pending"
                  ? t("status_pending")
                  : t("status_completed")}
              </Text>
            </View>
          </View>

          {/* Body */}
          <View style={styles.orderBody}>
            <Text style={[styles.productName, { color: theme.text }]}>
              {item.product_name}
            </Text>
          </View>

          {/* Admin Reply Preview */}
          {item.admin_reply && (
            <View
              style={[
                styles.replyPreview,
                {
                  backgroundColor: hasUnreadReply ? "#EFF6FF" : "#F9FAFB",
                  borderColor: hasUnreadReply ? "#BFDBFE" : "#E5E7EB",
                },
              ]}
            >
              <View style={styles.replyRow}>
                <Ionicons
                  name={hasUnreadReply ? "mail-unread" : "mail-open"}
                  size={16}
                  color={hasUnreadReply ? "#3B82F6" : "#9CA3AF"}
                />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.replyPreviewText,
                    {
                      color: hasUnreadReply ? "#1D4ED8" : "#6B7280",
                      fontWeight: hasUnreadReply ? "700" : "400",
                    },
                  ]}
                >
                  {item.admin_reply}
                </Text>
              </View>
              {hasUnreadReply && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>{t("new_reply")}</Text>
                </View>
              )}
            </View>
          )}

          {/* Footer */}
          <View
            style={[styles.orderFooter, { borderTopColor: theme.borderLight }]}
          >
            <Text style={[styles.dateText, { color: theme.textTertiary }]}>
              {date}
            </Text>
            <Text style={[styles.totalText, { color: theme.primary }]}>
              {formatPrice(item.total_amount)} {t("currency")}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [theme, t, formatPrice, handleViewReply],
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

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
            {
              maxWidth: responsive.isDesktop
                ? responsive.maxContentWidth
                : undefined,
              width: "100%",
              alignItems: "center",
            },
          ]}
        >
          <Text style={styles.headerTitle}>{t("my_orders")}</Text>
          <Text style={styles.headerSub}>
            {orders.length} {t("order")}
          </Text>
        </View>
      </LinearGradient>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            maxWidth: responsive.maxContentWidth,
            alignSelf: "center",
            width: "100%",
            paddingHorizontal: responsive.contentPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="cart-outline"
              size={56}
              color={theme.textTertiary}
            />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {t("no_orders")}
            </Text>
            <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
              {t("no_orders_desc")}
            </Text>
          </View>
        }
      />

      {/* Order Detail Modal */}
      <Modal
        visible={!!selectedOrder}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.surface }]}
          >
            {selectedOrder && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    {t("order_details")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedOrder(null)}
                    hitSlop={16}
                  >
                    <Ionicons name="close" size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>

                {/* Order Info */}
                <View
                  style={[
                    styles.modalSection,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <Text
                    style={[styles.modalLabel, { color: theme.textSecondary }]}
                  >
                    {t("order_id")}
                  </Text>
                  <Text style={[styles.modalValue, { color: theme.text }]}>
                    #{selectedOrder.id.slice(0, 8)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.modalSection,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <Text
                    style={[styles.modalLabel, { color: theme.textSecondary }]}
                  >
                    {t("product")}
                  </Text>
                  <Text style={[styles.modalValue, { color: theme.text }]}>
                    {selectedOrder.product_name}
                  </Text>
                </View>

                <View
                  style={[
                    styles.modalSection,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <View style={styles.modalRow}>
                    <View>
                      <Text
                        style={[
                          styles.modalLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {t("total")}
                      </Text>
                      <Text
                        style={[styles.modalValue, { color: theme.primary }]}
                      >
                        {formatPrice(selectedOrder.total_amount)}{" "}
                        {t("currency")}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={[
                          styles.modalLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {t("order_status")}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              STATUS_CONFIG[selectedOrder.status]?.bg ??
                              "#FEF3C7",
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color:
                              STATUS_CONFIG[selectedOrder.status]?.color ??
                              "#F59E0B",
                            fontSize: FontSize.small,
                            fontWeight: "600",
                          }}
                        >
                          {selectedOrder.status === "pending"
                            ? t("status_pending")
                            : t("status_completed")}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Admin Reply */}
                {selectedOrder.admin_reply ? (
                  <View style={styles.replySection}>
                    <View style={styles.replySectionHeader}>
                      <Ionicons
                        name="chatbubble-ellipses"
                        size={20}
                        color="#3B82F6"
                      />
                      <Text style={styles.replySectionTitle}>
                        {t("admin_reply")}
                      </Text>
                    </View>
                    <View style={styles.replyBox}>
                      <Text selectable style={[styles.replyBoxText]}>
                        {selectedOrder.admin_reply}
                      </Text>

                      {/* Copy button - show if code-like pattern found */}
                      {extractCode(selectedOrder.admin_reply) && (
                        <TouchableOpacity
                          onPress={() =>
                            copyToClipboard(
                              extractCode(selectedOrder.admin_reply!) ??
                                selectedOrder.admin_reply!,
                            )
                          }
                          style={[
                            styles.copyBtn,
                            copied && { backgroundColor: "#D1FAE5" },
                          ]}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={copied ? "checkmark-circle" : "copy-outline"}
                            size={16}
                            color={copied ? "#10B981" : "#3B82F6"}
                          />
                          <Text
                            style={[
                              styles.copyBtnText,
                              { color: copied ? "#10B981" : "#3B82F6" },
                            ]}
                          >
                            {copied ? t("code_copied") : t("copy_code")}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Full text copy button */}
                    <TouchableOpacity
                      onPress={() =>
                        copyToClipboard(selectedOrder.admin_reply!)
                      }
                      style={styles.copyAllBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="copy-outline" size={14} color="#6B7280" />
                      <Text style={styles.copyAllBtnText}>
                        {t("copy_full_reply")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.noReplySection}>
                    <Ionicons
                      name="hourglass-outline"
                      size={32}
                      color={theme.textTertiary}
                    />
                    <Text
                      style={[
                        styles.noReplyText,
                        { color: theme.textTertiary },
                      ]}
                    >
                      {t("awaiting_reply")}
                    </Text>
                  </View>
                )}

                <Text style={[styles.modalDate, { color: theme.textTertiary }]}>
                  {new Date(selectedOrder.created_at).toLocaleDateString(
                    "ar-SA",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
  },
  headerTitle: {
    fontSize: FontSize.titleLarge,
    fontWeight: FontWeight.bold,
    color: "#fff",
  },
  headerSub: {
    fontSize: FontSize.body,
    color: "rgba(255,255,255,0.7)",
    marginTop: Spacing.xxs,
  },
  listContent: {
    padding: Spacing.xl,
    paddingBottom: 120,
  },
  orderCard: {
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  orderIdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  orderIdText: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.medium,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
  },
  orderBody: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  productName: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xxs,
  },
  replyPreview: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  replyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  replyPreviewText: {
    flex: 1,
    fontSize: FontSize.small,
  },
  newBadge: {
    position: "absolute",
    top: -6,
    left: -6,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  dateText: {
    fontSize: FontSize.caption,
  },
  totalText: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.bold,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.massive,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.bold,
  },
  emptyText: {
    fontSize: FontSize.body,
    textAlign: "center",
    paddingHorizontal: Spacing.xxl,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: Spacing.massive,
    maxHeight: "85%",
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
  },
  modalSection: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  modalLabel: {
    fontSize: FontSize.small,
    marginBottom: 4,
  },
  modalValue: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.bold,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  replySection: {
    marginTop: Spacing.md,
  },
  replySectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  replySectionTitle: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.bold,
    color: "#3B82F6",
  },
  replyBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  replyBoxText: {
    fontSize: FontSize.body,
    lineHeight: 24,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: "#DBEAFE",
    borderRadius: Radius.md,
  },
  copyBtnText: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.semibold,
  },
  copyAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  copyAllBtnText: {
    fontSize: FontSize.caption,
    color: "#6B7280",
  },
  noReplySection: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  noReplyText: {
    fontSize: FontSize.body,
    textAlign: "center",
  },
  modalDate: {
    fontSize: FontSize.small,
    textAlign: "center",
    marginTop: Spacing.lg,
  },
});
