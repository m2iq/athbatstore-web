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
import {
  getWalletBalance,
  getWalletTransactions,
  redeemCode,
} from "@/services/wallet";
import { useAuthStore } from "@/stores/auth";
import type { WalletTransaction } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WalletScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { profile, updateBalance } = useAuthStore();
  const { alert } = useAlert();
  const responsive = useResponsive();

  const [balance, setBalance] = useState(Number(profile?.wallet_balance ?? 0));
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rechargeInput, setRechargeInput] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [bal, txns] = await Promise.all([
        getWalletBalance(),
        getWalletTransactions(20, 0),
      ]);
      setBalance(bal);
      setTransactions(txns);
      updateBalance(bal);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleRedeem = async () => {
    const code = rechargeInput.trim();
    if (!code) return;
    setRedeeming(true);
    try {
      const result = await redeemCode(code);
      if (result.success) {
        alert({
          title: t("recharge"),
          message: `${t("recharge_success")} ${result.amount} ${t("currency")}`,
          icon: "success",
        });
        setRechargeInput("");
        setShowRecharge(false);
        if (result.new_balance !== undefined) {
          setBalance(result.new_balance);
          updateBalance(result.new_balance);
        }
        await loadData();
      } else {
        alert({
          title: t("error"),
          message: result.error ?? t("recharge_error"),
          icon: "error",
        });
      }
    } catch {
      alert({ title: t("error"), message: t("recharge_error"), icon: "error" });
    } finally {
      setRedeeming(false);
    }
  };

  const formatCode = (text: string) => {
    const clean = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const parts = clean.match(/.{1,4}/g) || [];
    return parts.join("-").slice(0, 19); // XXXX-XXXX-XXXX-XXXX
  };

  const renderTransaction = useCallback(
    ({ item }: { item: WalletTransaction }) => {
      const isCredit = item.type === "credit";
      return (
        <View
          style={[
            styles.txnCard,
            { backgroundColor: theme.surface },
            Shadow.sm,
          ]}
        >
          <View
            style={[
              styles.txnIcon,
              {
                backgroundColor: isCredit ? theme.accentSoft : theme.errorLight,
              },
            ]}
          >
            <Ionicons
              name={isCredit ? "arrow-down-circle" : "arrow-up-circle"}
              size={22}
              color={isCredit ? theme.accent : theme.error}
            />
          </View>
          <View style={styles.txnInfo}>
            <Text style={[styles.txnType, { color: theme.text }]}>
              {isCredit ? t("credit") : t("debit")}
            </Text>
            <Text style={[styles.txnRef, { color: theme.textSecondary }]}>
              {item.reference_type === "recharge"
                ? t("recharge")
                : item.reference_type === "purchase"
                  ? t("purchase")
                  : item.reference_type}
            </Text>
          </View>
          <View style={styles.txnAmountCol}>
            <Text
              style={[
                styles.txnAmount,
                { color: isCredit ? theme.success : theme.error },
              ]}
            >
              {isCredit ? "+" : "-"}
              {item.amount}
            </Text>
            <Text style={[styles.txnBalance, { color: theme.textTertiary }]}>
              {item.balance_after}
            </Text>
          </View>
        </View>
      );
    },
    [theme, t],
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
      {/* Balance Header */}
      <LinearGradient
        colors={theme.gradientBanner as unknown as [string, string]}
        style={[
          styles.balanceHeader,
          { paddingTop: insets.top + Spacing.lg, alignItems: "center" },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
          <Text style={styles.balanceLabel}>{t("wallet_balance")}</Text>
          <Text style={styles.balanceAmount}>{balance.toLocaleString()}</Text>
          <Text style={styles.balanceCurrency}>{t("currency")}</Text>

          <TouchableOpacity
            style={styles.rechargeBtn}
            onPress={() => setShowRecharge(!showRecharge)}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.rechargeBtnText}>{t("recharge")}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Recharge Input */}
      {showRecharge && (
        <View
          style={[
            styles.rechargeCard,
            {
              backgroundColor: theme.surface,
              maxWidth: responsive.isWeb ? 600 : undefined,
              alignSelf: responsive.isWeb ? ("center" as const) : undefined,
              width: responsive.isWeb ? "100%" : undefined,
            },
            Shadow.md,
          ]}
        >
          <Text style={[styles.rechargeTitle, { color: theme.text }]}>
            {t("recharge_code")}
          </Text>
          <View
            style={[
              styles.codeInputRow,
              {
                borderColor: theme.inputBorder,
                backgroundColor: theme.inputBackground,
              },
            ]}
          >
            <Ionicons name="card-outline" size={20} color={theme.placeholder} />
            <TextInput
              value={rechargeInput}
              onChangeText={(text) => setRechargeInput(formatCode(text))}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              placeholderTextColor={theme.placeholder}
              style={[styles.codeInput, { color: theme.text }]}
              maxLength={19}
              autoCapitalize="characters"
            />
          </View>
          <TouchableOpacity
            onPress={handleRedeem}
            disabled={redeeming || rechargeInput.length < 19}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={theme.gradientCTA as unknown as [string, string]}
              style={[
                styles.redeemBtn,
                (redeeming || rechargeInput.length < 19) && { opacity: 0.5 },
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {redeeming ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.redeemBtnText}>{t("recharge")}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Balance Contact Card */}
      <View
        style={[
          styles.contactCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.borderLight,
            maxWidth: responsive.isWeb ? 600 : undefined,
            alignSelf: responsive.isWeb ? ("center" as const) : undefined,
            width: responsive.isWeb ? "100%" : undefined,
          },
          Shadow.sm,
        ]}
      >
        <View style={styles.contactCardContent}>
          <View
            style={[
              styles.contactIconBox,
              { backgroundColor: `${theme.primary}12` },
            ]}
          >
            <Ionicons name="wallet" size={24} color={theme.primary} />
          </View>
          <View style={styles.contactTextBox}>
            <Text style={[styles.contactTitle, { color: theme.text }]}>
              {t("add_balance_title")}
            </Text>
            <Text style={[styles.contactDesc, { color: theme.textSecondary }]}>
              {t("add_balance_desc")}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            const whatsappUrl =
              "https://wa.me/9647719045309?text=اريد%20إضافة%20رصيد%20إلى%20محفظتي";
            Linking.openURL(whatsappUrl);
          }}
          activeOpacity={0.7}
          style={styles.contactBtn}
        >
          <LinearGradient
            colors={["#25D366", "#128C7E"] as [string, string]}
            style={styles.contactBtnInner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text style={styles.contactBtnText}>{t("contact_admin")}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Transaction History */}
      <View style={styles.historySection}>
        <Text style={[styles.historyTitle, { color: theme.text }]}>
          {t("transaction_history")}
        </Text>
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
                name="receipt-outline"
                size={48}
                color={theme.textTertiary}
              />
              <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
                {t("no_transactions")}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  balanceHeader: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: FontSize.body,
    color: "rgba(255,255,255,0.8)",
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.black,
    color: "#fff",
  },
  balanceCurrency: {
    fontSize: FontSize.bodyLarge,
    color: "rgba(255,255,255,0.7)",
    marginTop: Spacing.xxs,
    marginBottom: Spacing.lg,
  },
  rechargeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  rechargeBtnText: {
    color: "#fff",
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
  },
  rechargeCard: {
    marginHorizontal: Spacing.xl,
    marginTop: -Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
  },
  rechargeTitle: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },
  codeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 52,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  codeInput: {
    flex: 1,
    fontSize: FontSize.bodyLarge,
    letterSpacing: 2,
    fontWeight: FontWeight.semibold,
    textAlign: "center",
  },
  redeemBtn: {
    height: 48,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  redeemBtnText: {
    color: "#fff",
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
  },
  contactCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  contactCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  contactIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  contactTextBox: {
    flex: 1,
  },
  contactTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  contactDesc: {
    fontSize: FontSize.small,
    lineHeight: 18,
  },
  contactBtn: {
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  contactBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: 44,
    borderRadius: Radius.md,
  },
  contactBtnText: {
    color: "#fff",
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
  },
  historySection: {
    flex: 1,
    paddingTop: Spacing.xl,
  },
  historyTitle: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.bold,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 120,
  },
  txnCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  txnIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  txnInfo: {
    flex: 1,
  },
  txnType: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
  },
  txnRef: {
    fontSize: FontSize.small,
    marginTop: 2,
  },
  txnAmountCol: {
    alignItems: "flex-end",
  },
  txnAmount: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
  },
  txnBalance: {
    fontSize: FontSize.caption,
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.massive,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.body,
  },
});
