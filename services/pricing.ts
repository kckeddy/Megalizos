import * as Localization from 'expo-localization';

export type AccountType = 'single-artist' | 'artist-manager' | 'record-label';
export type PlanId = 'starter' | 'professional' | 'manager' | 'enterprise';

export interface AccountOption {
  id: AccountType;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
}

export interface SubscriptionPlan {
  id: PlanId;
  name: string;
  badge?: string;
  monthlyUsd: number;
  description: string;
  features: string[];
}

export interface PricingProfile {
  country: string;
  currency: string;
  region: string;
  currencySymbol: string;
  locale: string;
}

export const accountOptions: AccountOption[] = [
  {
    id: 'single-artist',
    title: 'Single Artist',
    subtitle: 'Independent musician',
    description: 'Manage your releases, income, and audience from one polished workspace.',
    features: ['Artist profile', 'Royalty tracking', 'Release scheduling', 'Streaming analytics'],
  },
  {
    id: 'artist-manager',
    title: 'Artist Manager',
    subtitle: 'For multiple clients',
    description: 'Run artist teams, approvals, and performance dashboards with streamlined visibility.',
    features: ['Multi-artist workspace', 'Team collaboration', 'Approval workflow', 'Revenue tracking'],
  },
  {
    id: 'record-label',
    title: 'Record Label',
    subtitle: 'Label-scale operations',
    description: 'Manage catalog operations, rights, and distribution on a premium enterprise stack.',
    features: ['Unlimited artists', 'Catalog management', 'Bulk upload', 'Distribution tracking'],
  },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter Artist',
    monthlyUsd: 19,
    description: 'A focused launch plan for emerging artists.',
    features: ['1 artist profile', '5 releases/year', 'Basic analytics', 'Scheduled releases'],
  },
  {
    id: 'professional',
    name: 'Professional Artist',
    badge: 'Most popular',
    monthlyUsd: 49,
    description: 'The complete toolkit for release growth and monetization.',
    features: ['Unlimited releases', 'Advanced analytics', 'Pre-save campaigns', 'Royalty reports'],
  },
  {
    id: 'manager',
    name: 'Manager Plan',
    monthlyUsd: 89,
    description: 'Built for teams managing multiple artist careers.',
    features: ['Multiple artists', 'Revenue management', 'Client dashboards', 'Team collaboration'],
  },
  {
    id: 'enterprise',
    name: 'Label Enterprise',
    monthlyUsd: 199,
    description: 'Scale a catalog with broad operations, rights, and API integrations.',
    features: ['Unlimited artists', 'White-label portal', 'API access', 'Dedicated support'],
  },
];

const currencyScale: Record<string, number> = {
  USD: 1,
  CAD: 1.35,
  GBP: 0.78,
  EUR: 0.92,
  NGN: 1500,
  KES: 128,
  ZAR: 18.5,
  GHS: 15.7,
  XAF: 610,
};

const regionByCountry: Record<string, { region: string; currency: string; country: string }> = {
  US: { region: 'USA', currency: 'USD', country: 'United States' },
  CA: { region: 'Canada', currency: 'CAD', country: 'Canada' },
  GB: { region: 'United Kingdom', currency: 'GBP', country: 'United Kingdom' },
  DE: { region: 'Europe', currency: 'EUR', country: 'Germany' },
  FR: { region: 'Europe', currency: 'EUR', country: 'France' },
  ES: { region: 'Europe', currency: 'EUR', country: 'Spain' },
  IT: { region: 'Europe', currency: 'EUR', country: 'Italy' },
  NG: { region: 'Africa', currency: 'NGN', country: 'Nigeria' },
  KE: { region: 'Africa', currency: 'KES', country: 'Kenya' },
  ZA: { region: 'Africa', currency: 'ZAR', country: 'South Africa' },
  GH: { region: 'Africa', currency: 'GHS', country: 'Ghana' },
  CM: { region: 'Africa', currency: 'XAF', country: 'Cameroon' },
  SN: { region: 'Africa', currency: 'XAF', country: 'Senegal' },
  IN: { region: 'Asia', currency: 'INR', country: 'India' },
  SG: { region: 'Asia', currency: 'SGD', country: 'Singapore' },
  JP: { region: 'Asia', currency: 'JPY', country: 'Japan' },
  AU: { region: 'Asia', currency: 'AUD', country: 'Australia' },
};

export function getPricingProfile(): PricingProfile {
  const locales = Localization.getLocales?.() ?? [];
  const firstLocale = locales[0];
  const countryCode = (firstLocale?.countryCode || firstLocale?.regionCode || 'US').toUpperCase();
  const source = regionByCountry[countryCode] || {
    region: 'USA',
    currency: 'USD',
    country: 'United States',
  };

  return {
    country: source.country,
    region: source.region,
    currency: source.currency,
    locale: firstLocale?.languageCode || 'en',
    currencySymbol: source.currency === 'USD' ? '$' : source.currency === 'GBP' ? '£' : source.currency === 'EUR' ? '€' : source.currency === 'CAD' ? 'C$' : source.currency === 'NGN' ? '₦' : source.currency === 'KES' ? 'KSh' : source.currency === 'ZAR' ? 'R' : source.currency === 'GHS' ? '₵' : source.currency === 'XAF' ? 'FCFA' : source.currency,
  };
}

export function formatCurrency(value: number, currency: string): string {
  const safeCurrency = currency || 'USD';
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: safeCurrency,
      maximumFractionDigits: safeCurrency === 'NGN' || safeCurrency === 'KES' || safeCurrency === 'GHS' || safeCurrency === 'XAF' ? 0 : 2,
    });

    return formatter.format(value);
  } catch {
    const symbol = safeCurrency === 'USD' ? '$' : safeCurrency === 'EUR' ? '€' : safeCurrency === 'GBP' ? '£' : safeCurrency === 'CAD' ? 'C$' : safeCurrency === 'NGN' ? '₦' : safeCurrency === 'KES' ? 'KSh' : safeCurrency === 'ZAR' ? 'R' : safeCurrency === 'GHS' ? '₵' : safeCurrency === 'XAF' ? 'FCFA' : safeCurrency;
    return `${symbol}${value.toFixed(safeCurrency === 'USD' || safeCurrency === 'EUR' || safeCurrency === 'GBP' || safeCurrency === 'CAD' ? 2 : 0)}`;
  }
}

export function getLocalizedPlanPrice(plan: SubscriptionPlan, currency: string): number {
  const scale = currencyScale[currency] || 1;
  const base = plan.monthlyUsd * scale;
  if (currency === 'NGN' || currency === 'KES' || currency === 'GHS' || currency === 'XAF') {
    return Math.round(base);
  }
  return Number(base.toFixed(2));
}

export function getPlanPrice(planId: PlanId, currency: string): number {
  const plan = subscriptionPlans.find((candidate) => candidate.id === planId);
  if (!plan) return 0;
  return getLocalizedPlanPrice(plan, currency);
}

export function getPlanById(planId: PlanId): SubscriptionPlan | undefined {
  return subscriptionPlans.find((plan) => plan.id === planId);
}

export function getCurrencyOptions(): string[] {
  return ['USD', 'CAD', 'EUR', 'GBP', 'NGN', 'KES', 'ZAR', 'GHS', 'XAF'];
}
