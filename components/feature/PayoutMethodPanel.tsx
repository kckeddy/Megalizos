import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button, Chip, Field, Panel } from '@/components/ui/Controls';
import { usePayout } from '@/hooks/usePayout';
import { maskDestination, payoutKinds } from '@/services/payouts';
import { colors, fonts, radius, spacing } from '@/constants/theme';

export function PayoutMethodPanel() {
  const payout = usePayout();
  const active = payoutKinds.find((option) => option.id === payout.kind) || payoutKinds[0];

  return (
    <Panel>
      <View style={styles.headerRow}>
        <View style={styles.icon}>
          <Feather name="credit-card" color={colors.primary} size={24} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.section}>Your payout destination</Text>
          <Text style={styles.label}>
            {payout.loading
              ? 'Checking this device…'
              : payout.method
                ? `${payout.methodLabel} · ${maskDestination(payout.method)}`
                : 'No payout account connected'}
          </Text>
        </View>
        {payout.method && !payout.editing ? (
          <Button label="Edit" secondary icon="edit-2" onPress={payout.startEditing} />
        ) : null}
      </View>

      {payout.loading ? <ActivityIndicator color={colors.primary} /> : null}

      {payout.editing ? (
        <View style={styles.form}>
          <Text style={styles.label}>Payout method</Text>
          <View style={styles.chips}>
            {payoutKinds.map((option) => (
              <Chip
                key={option.id}
                label={option.label}
                selected={payout.kind === option.id}
                onPress={() => payout.setKind(option.id)}
                disabled={payout.saving}
              />
            ))}
          </View>
          <Field
            label="Account holder name"
            value={payout.accountName}
            onChangeText={payout.setAccountName}
            editable={!payout.saving}
            maxLength={80}
            placeholder="Name on the account"
          />
          <Field
            label={active.placeholder}
            value={payout.destination}
            onChangeText={payout.setDestination}
            editable={!payout.saving}
            maxLength={64}
            autoCapitalize="none"
            placeholder={active.placeholder}
          />
          <Text style={styles.helper}>{active.hint}</Text>
          <View style={styles.actions}>
            <View style={styles.grow}>
              <Button
                label={payout.saving ? 'Saving…' : 'Save payout destination'}
                icon="check"
                disabled={payout.saving}
                onPress={() => {
                  void payout.save();
                }}
              />
            </View>
            <Button label="Cancel" secondary disabled={payout.saving} onPress={payout.cancel} />
          </View>
          {payout.method ? (
            <Button
              label="Remove saved destination"
              secondary
              icon="trash-2"
              disabled={payout.saving}
              onPress={() => {
                void payout.remove();
              }}
            />
          ) : null}
        </View>
      ) : null}

      {payout.error ? (
        <View style={styles.feedback}>
          <Feather name="alert-circle" size={18} color={colors.danger} />
          <Text accessibilityRole="alert" style={styles.error}>
            {payout.error}
          </Text>
        </View>
      ) : null}
      {payout.notice ? (
        <View style={styles.feedback}>
          <Feather name="check-circle" size={18} color={colors.primary} />
          <Text style={styles.success}>{payout.notice}</Text>
        </View>
      ) : null}

      <Text style={styles.body}>
        This local demo cannot collect royalties or send payments. A saved destination is kept on this device only and is
        never transmitted. Connect a verified account when live distribution is enabled.
      </Text>
    </Panel>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerText: { flex: 1, gap: spacing.sm },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { color: colors.text, fontSize: fonts.body, fontWeight: '600' },
  label: { color: colors.subtle, fontSize: fonts.small, lineHeight: 20 },
  form: { gap: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  helper: { color: colors.subtle, fontSize: fonts.small, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  grow: { flex: 1 },
  feedback: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  error: { flex: 1, color: colors.danger, fontSize: fonts.label, lineHeight: 22 },
  success: { flex: 1, color: colors.primary, fontSize: fonts.label, lineHeight: 22 },
  body: { color: colors.subtle, fontSize: fonts.label, lineHeight: 23 },
});
