import { View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Panel } from '@/components/ui/Controls';
import { useSubscription } from '@/hooks/useSubscription';
import { formatCurrency, getPlanById, getPlanPrice, subscriptionPlans } from '@/services/pricing';
import { colors, fonts, radius, spacing } from '@/constants/theme';

export function PlanSelector() {
  const subscription = useSubscription();
  const { profile } = subscription;

  return (
    <Panel>
      <View style={styles.headerRow}>
        <View style={styles.icon}>
          <Feather name="star" color={colors.primary} size={20} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.section}>Subscription plan</Text>
          <Text style={styles.label}>
            {getPlanById(subscription.planId)?.name || 'Starter Artist'} · {profile.country}
          </Text>
        </View>
        {subscription.loading ? <ActivityIndicator color={colors.primary} /> : null}
      </View>

      <View style={styles.list}>
        {subscriptionPlans.map((plan) => {
          const selected = plan.id === subscription.planId;
          return (
            <Pressable
              key={plan.id}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled: subscription.saving }}
              disabled={subscription.saving}
              onPress={() => {
                void subscription.selectPlan(plan.id);
              }}
              style={({ pressed }) => [styles.option, selected ? styles.selected : null, pressed ? styles.pressed : null]}
            >
              <View style={styles.optionText}>
                <View style={styles.titleRow}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  {plan.badge ? <Text style={styles.badge}>{plan.badge}</Text> : null}
                </View>
                <Text style={styles.label}>{plan.description}</Text>
              </View>
              <View style={styles.priceWrap}>
                <Text style={[styles.price, selected ? styles.priceSelected : null]}>
                  {formatCurrency(getPlanPrice(plan.id, profile.currency), profile.currency)}
                </Text>
                <Text style={styles.label}>/ month</Text>
              </View>
              {selected ? <Feather name="check-circle" size={18} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </View>

      {subscription.error ? (
        <View style={styles.feedback}>
          <Feather name="alert-circle" size={18} color={colors.danger} />
          <Text accessibilityRole="alert" style={styles.error}>
            {subscription.error}
          </Text>
        </View>
      ) : null}
      {subscription.notice ? (
        <View style={styles.feedback}>
          <Feather name="check-circle" size={18} color={colors.primary} />
          <Text style={styles.success}>{subscription.notice}</Text>
        </View>
      ) : null}

      <Text style={styles.helper}>
        Plan selection is stored on this device for this artist account. Prices are shown in {profile.currency} using
        approximate conversions; no payment is taken and no billing is connected.
      </Text>
    </Panel>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerText: { flex: 1, gap: spacing.sm },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { color: colors.text, fontSize: fonts.section, fontWeight: '600' },
  label: { color: colors.subtle, fontSize: fonts.small, lineHeight: 20 },
  list: { gap: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.primaryDark },
  pressed: { opacity: 0.75 },
  optionText: { flex: 1, gap: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  planName: { color: colors.text, fontSize: fonts.body, fontWeight: '600' },
  badge: {
    color: colors.primary,
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  priceWrap: { alignItems: 'flex-end' },
  price: { color: colors.text, fontSize: fonts.body, fontWeight: '600' },
  priceSelected: { color: colors.primary },
  feedback: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  error: { flex: 1, color: colors.danger, fontSize: fonts.label, lineHeight: 22 },
  success: { flex: 1, color: colors.primary, fontSize: fonts.label, lineHeight: 22 },
  helper: { color: colors.subtle, fontSize: fonts.label, lineHeight: 23 },
});
