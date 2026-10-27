import { useMemo, useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Button, Field } from '@/components/ui/Controls';
import { useArtistAuth } from '@/hooks/useArtistAuth';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import {
  accountOptions,
  AccountType,
  formatCurrency,
  getCurrencyOptions,
  getPlanPrice,
  getPricingProfile,
  subscriptionPlans,
} from '@/services/pricing';

export function ArtistAuth() {
  const form = useArtistAuth();
  const registering = form.mode === 'register';
  const pricing = useMemo(() => getPricingProfile(), []);
  const [accountType, setAccountType] = useState<AccountType>('single-artist');
  const [selectedPlanId, setSelectedPlanId] = useState<'starter' | 'professional' | 'manager' | 'enterprise'>('professional');
  const [currency, setCurrency] = useState(pricing.currency);
  const currencyOptions = useMemo(() => getCurrencyOptions(), []);

  const selectedPlan = subscriptionPlans.find((plan) => plan.id === selectedPlanId) ?? subscriptionPlans[1];
  const activePrice = getPlanPrice(selectedPlanId, currency);

  const primaryLabel = registering ? (form.codeSent ? 'Verify account' : 'Create account') : 'Sign in to dashboard';

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Feather name="disc" size={18} color={colors.primary} />
            </View>
            <Text style={styles.brandText}>Megalizos</Text>
          </View>

          <Text style={styles.eyebrow}>Professional music release platform</Text>
          <Text style={styles.title}>Launch, distribute, and grow your catalog.</Text>
          <Text style={styles.subtitle}>
            Built for artists, managers, and labels who need premium release operations and real-time audience insights.
          </Text>

          <View style={styles.heroGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.panelLabel}>Detected market</Text>
              <Text style={styles.marketValue}>{pricing.country}</Text>
              <Text style={styles.marketSub}>{pricing.region} • {pricing.currency}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.panelLabel}>Selected plan</Text>
              <Text style={styles.marketValue}>{selectedPlan.name}</Text>
              <Text style={styles.marketSub}>{formatCurrency(activePrice, currency)} / month</Text>
            </View>
          </View>

          <View style={styles.modeRow}>
            <Pressable
              accessibilityRole="button"
              style={[styles.modeButton, !registering && styles.modeButtonActive]}
              onPress={() => form.setMode('login')}
            >
              <Text style={[styles.modeText, !registering && styles.modeTextActive]}>Sign in</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={[styles.modeButton, registering && styles.modeButtonActive]}
              onPress={() => form.setMode('register')}
            >
              <Text style={[styles.modeText, registering && styles.modeTextActive]}>Create account</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Account type</Text>
          <View style={styles.accountGrid}>
            {accountOptions.map((option) => {
              const selected = option.id === accountType;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  onPress={() => setAccountType(option.id)}
                  style={[styles.accountCard, selected && styles.accountCardActive]}
                >
                  <View style={styles.accountBadgeRow}>
                    <Text style={styles.accountTitle}>{option.title}</Text>
                    {selected ? <Feather name="check-circle" size={18} color={colors.primary} /> : null}
                  </View>
                  <Text style={styles.accountSubtitle}>{option.subtitle}</Text>
                  <Text style={styles.accountDescription}>{option.description}</Text>
                  <View style={styles.accountFeatureWrap}>
                    {option.features.map((feature) => (
                      <Text key={feature} style={styles.accountFeature}>{feature}</Text>
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.currencyRow}>
            {currencyOptions.map((option) => (
              <Pressable
                key={option}
                accessibilityRole="button"
                onPress={() => setCurrency(option)}
                style={[styles.currencyChip, currency === option && styles.currencyChipActive]}
              >
                <Text style={[styles.currencyChipText, currency === option && styles.currencyChipTextActive]}>{option}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.planGrid}>
            {subscriptionPlans.map((plan) => {
              const isSelected = plan.id === selectedPlanId;
              return (
                <Pressable
                  key={plan.id}
                  accessibilityRole="button"
                  onPress={() => setSelectedPlanId(plan.id)}
                  style={[styles.planCard, isSelected && styles.planCardActive]}
                >
                  {plan.badge ? <Text style={styles.planBadge}>{plan.badge}</Text> : null}
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planPrice}>{formatCurrency(getPlanPrice(plan.id, currency), currency)}</Text>
                  <Text style={styles.planMeta}>per month</Text>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                  <View style={styles.planFeatureList}>
                    {plan.features.map((feature) => (
                      <Text key={feature} style={styles.planFeature}>{feature}</Text>
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Account details</Text>
            <Field
              label="Work email"
              placeholder="artist@studio.com"
              value={form.email}
              onChangeText={form.setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
            <Field
              label="Password"
              placeholder="Minimum 8 characters"
              secureTextEntry
              value={form.password}
              onChangeText={form.setPassword}
            />
            {registering ? (
              <Field
                label="Confirm password"
                placeholder="Type your password again"
                secureTextEntry
                value={form.confirm}
                onChangeText={form.setConfirm}
              />
            ) : null}
            {registering && form.codeSent ? (
              <Field
                label="Verification code"
                placeholder="4-digit code"
                value={form.otp}
                onChangeText={form.setOtp}
                keyboardType="number-pad"
              />
            ) : null}

            {(form.error || form.notice) ? (
              <Text style={[styles.message, form.error ? styles.errorText : styles.noticeText]}>
                {form.error || form.notice}
              </Text>
            ) : null}

            <Button
              label={primaryLabel}
              onPress={() => form.perform()}
              disabled={form.disabled}
              icon={registering ? 'check' : 'arrow-right'}
            />

            {registering ? (
              <Pressable onPress={() => form.perform(true)} style={styles.inlineAction}>
                <Text style={styles.inlineActionText}>Resend verification code</Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { color: colors.text, fontSize: fonts.section, fontWeight: '700' },
  eyebrow: {
    color: colors.primary,
    fontSize: fonts.label,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  title: { color: colors.text, fontSize: 34, fontWeight: '800', lineHeight: 40, marginBottom: spacing.sm },
  subtitle: { color: colors.subtle, fontSize: fonts.body, lineHeight: 24, marginBottom: spacing.lg },
  heroGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  metricCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  panelLabel: { color: colors.subtle, fontSize: fonts.small, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.xs },
  marketValue: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 2 },
  marketSub: { color: colors.subtle, fontSize: fonts.small },
  modeRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: 4, marginBottom: spacing.lg },
  modeButton: { flex: 1, paddingVertical: 12, borderRadius: radius.sm, alignItems: 'center' },
  modeButtonActive: { backgroundColor: colors.primary },
  modeText: { color: colors.subtle, fontWeight: '700' },
  modeTextActive: { color: colors.background },
  sectionTitle: { color: colors.text, fontSize: fonts.section, fontWeight: '700', marginBottom: spacing.md },
  accountGrid: { gap: spacing.md, marginBottom: spacing.lg },
  accountCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  accountCardActive: { borderColor: colors.primary, backgroundColor: colors.primaryDark },
  accountBadgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  accountTitle: { color: colors.text, fontSize: fonts.body, fontWeight: '700' },
  accountSubtitle: { color: colors.primary, fontSize: fonts.small, fontWeight: '600', marginBottom: spacing.xs },
  accountDescription: { color: colors.subtle, fontSize: fonts.small, lineHeight: 18, marginBottom: spacing.sm },
  accountFeatureWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  accountFeature: {
    color: colors.text,
    backgroundColor: 'rgba(211, 248, 121, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 10,
    overflow: 'hidden',
  },
  currencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  currencyChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  currencyChipText: { color: colors.text, fontWeight: '700' },
  currencyChipTextActive: { color: colors.background },
  planGrid: { gap: spacing.md, marginBottom: spacing.lg },
  planCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md },
  planCardActive: { borderColor: colors.primary, backgroundColor: colors.primaryDark },
  planBadge: { alignSelf: 'flex-start', backgroundColor: colors.primary, color: colors.background, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontWeight: '700', marginBottom: spacing.sm, overflow: 'hidden' },
  planName: { color: colors.text, fontWeight: '700', fontSize: fonts.body, marginBottom: spacing.xs },
  planPrice: { color: colors.primary, fontWeight: '800', fontSize: 28 },
  planMeta: { color: colors.subtle, fontSize: fonts.small, marginBottom: spacing.sm },
  planDescription: { color: colors.subtle, fontSize: fonts.small, lineHeight: 18, marginBottom: spacing.sm },
  planFeatureList: { gap: 8 },
  planFeature: { color: colors.text, fontSize: 12, lineHeight: 18 },
  formCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  message: { marginTop: spacing.sm, marginBottom: spacing.md, fontSize: fonts.small, lineHeight: 18 },
  errorText: { color: '#ff8a80' },
  noticeText: { color: colors.primary },
  inlineAction: { marginTop: spacing.md, alignItems: 'center' },
  inlineActionText: { color: colors.primary, fontWeight: '700' },
});

export default ArtistAuth;
