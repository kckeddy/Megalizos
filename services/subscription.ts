import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlanId, subscriptionPlans } from '@/services/pricing';

export const defaultPlanId: PlanId = 'starter';

function isPlanId(value: unknown): value is PlanId {
  return subscriptionPlans.some(plan => plan.id === value);
}

const planKey = (userId: string) => `megalizos.plan.v1.${userId}`;

export function parsePlan(value: string | null): PlanId {
  if (!value) return defaultPlanId;
  return isPlanId(value) ? value : defaultPlanId;
}

export async function loadPlan(userId: string): Promise<PlanId> {
  return parsePlan(await AsyncStorage.getItem(planKey(userId)));
}

export async function savePlan(userId: string, planId: PlanId): Promise<void> {
  await AsyncStorage.setItem(planKey(userId), planId);
}
