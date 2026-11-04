import AsyncStorage from '@react-native-async-storage/async-storage';

export type PayoutKind = 'bank' | 'paypal' | 'mobile-money';

export interface PayoutMethod {
  kind: PayoutKind;
  accountName: string;
  destination: string;
  updatedAt: string;
}

export interface PayoutKindOption {
  id: PayoutKind;
  label: string;
  hint: string;
  placeholder: string;
}

export const payoutKinds: PayoutKindOption[] = [
  { id: 'bank', label: 'Bank transfer', hint: 'Use the account number shown on your statement.', placeholder: 'Account number' },
  { id: 'paypal', label: 'PayPal', hint: 'Royalties are sent to your PayPal email.', placeholder: 'you@example.com' },
  { id: 'mobile-money', label: 'Mobile money', hint: 'Use the number registered to your wallet.', placeholder: 'Wallet phone number' },
];

const payoutKey = (userId: string) => `megalizos.payout.v1.${userId}`;

function isPayoutKind(value: unknown): value is PayoutKind {
  return value === 'bank' || value === 'paypal' || value === 'mobile-money';
}

export function parsePayout(value: string | null): PayoutMethod | null {
  if (!value) return null;
  let data: unknown;
  try {
    data = JSON.parse(value);
  } catch {
    throw new Error('The saved payout destination could not be read.');
  }
  if (!data || typeof data !== 'object') throw new Error('The saved payout destination could not be read.');
  const record = data as Partial<PayoutMethod>;
  if (!isPayoutKind(record.kind) || typeof record.accountName !== 'string' || typeof record.destination !== 'string' || typeof record.updatedAt !== 'string') {
    throw new Error('The saved payout destination could not be read.');
  }
  return { kind: record.kind, accountName: record.accountName, destination: record.destination, updatedAt: record.updatedAt };
}

export async function loadPayout(userId: string): Promise<PayoutMethod | null> {
  return parsePayout(await AsyncStorage.getItem(payoutKey(userId)));
}

export async function savePayout(userId: string, method: PayoutMethod): Promise<void> {
  await AsyncStorage.setItem(payoutKey(userId), JSON.stringify(method));
}

export async function clearPayout(userId: string): Promise<void> {
  await AsyncStorage.removeItem(payoutKey(userId));
}

export function validatePayout(kind: PayoutKind, accountName: string, destination: string): string {
  const name = accountName.trim();
  const value = destination.trim();
  if (name.length < 2) return 'Enter the account holder name (at least 2 characters).';
  if (name.length > 80) return 'Account holder name must be 80 characters or fewer.';
  if (!value) return 'Enter a payout destination.';
  if (kind === 'paypal') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ? '' : 'Enter a valid PayPal email address.';
  }
  if (kind === 'bank') {
    const digits = value.replace(/[\s-]/g, '');
    return /^\d{6,34}$/.test(digits) ? '' : 'Enter a bank account number of 6–34 digits.';
  }
  const digits = value.replace(/[\s-]/g, '');
  return /^\+?\d{7,15}$/.test(digits) ? '' : 'Enter a mobile money number of 7–15 digits.';
}

export function maskDestination(method: PayoutMethod): string {
  const value = method.destination.trim();
  if (method.kind === 'paypal') {
    const [name, domain] = value.split('@');
    if (!domain) return value;
    return `${name.slice(0, 2)}${'•'.repeat(Math.max(name.length - 2, 3))}@${domain}`;
  }
  const compact = value.replace(/[\s-]/g, '');
  if (compact.length <= 4) return compact;
  return `•••• ${compact.slice(-4)}`;
}

export function payoutKindLabel(kind: PayoutKind): string {
  return payoutKinds.find(option => option.id === kind)?.label || 'Payout method';
}
