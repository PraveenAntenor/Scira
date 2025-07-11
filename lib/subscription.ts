// lib/subscription.ts
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { subscription } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export type SubscriptionDetails = {
  id: string;
  productId: string;
  status: string;
  amount: number;
  currency: string;
  recurringInterval: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  organizationId: string | null;
};

export type SubscriptionDetailsResult = {
  hasSubscription: boolean;
  subscription?: SubscriptionDetails;
  error?: string;
  errorType?: 'CANCELED' | 'EXPIRED' | 'GENERAL';
};

export async function getSubscriptionDetails(): Promise<SubscriptionDetailsResult> {
  'use server';

  try {
    /* 1️⃣  Build plain HeadersInit and call BetterAuth */
    const hdr = Object.fromEntries(await headers()) as HeadersInit;
    const req = new Request('http://localhost/api/auth/session', { headers: hdr });
    const res = await auth(req);


    
    if (!res.ok) return { hasSubscription: false };

    const sess = (await res.json()) as { user?: { id: string } } | null;
    if (!sess?.user?.id) return { hasSubscription: false };

    /* 2️⃣  Look up user subscriptions */
    const userSubs = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, sess.user.id));

    if (!userSubs.length) return { hasSubscription: false };

    /* 3️⃣  Find active (or latest) subscription */
    const active = userSubs
      .filter((s) => s.status === 'active')
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];

    const subRow = active ?? userSubs.sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    )[0];

    const sub: SubscriptionDetails = {
      id: subRow.id,
      productId: subRow.productId,
      status: subRow.status,
      amount: subRow.amount,
      currency: subRow.currency,
      recurringInterval: subRow.recurringInterval,
      currentPeriodStart: subRow.currentPeriodStart,
      currentPeriodEnd: subRow.currentPeriodEnd,
      cancelAtPeriodEnd: subRow.cancelAtPeriodEnd,
      canceledAt: subRow.canceledAt,
      organizationId: null,
    };

    if (active) {
      return { hasSubscription: true, subscription: sub };
    }

    /* 4️⃣  Handle canceled / expired */
    const now = Date.now();
    const expired = +new Date(sub.currentPeriodEnd) < now;
    const canceled = sub.status === 'canceled';

    return {
      hasSubscription: true,
      subscription: sub,
      error: canceled
        ? 'Subscription has been canceled'
        : expired
          ? 'Subscription has expired'
          : 'Subscription is not active',
      errorType: canceled ? 'CANCELED' : expired ? 'EXPIRED' : 'GENERAL',
    };
  } catch (err) {
    console.error('Error fetching subscription details:', err);
    return {
      hasSubscription: false,
      error: 'Failed to load subscription details',
      errorType: 'GENERAL',
    };
  }
}

/* ─────── Convenience wrappers (unchanged) ─────── */
export async function isUserSubscribed() {
  const r = await getSubscriptionDetails();
  return r.hasSubscription && r.subscription?.status === 'active';
}

export async function hasAccessToProduct(productId: string) {
  const r = await getSubscriptionDetails();
  return (
    r.hasSubscription &&
    r.subscription?.status === 'active' &&
    r.subscription.productId === productId
  );
}

export async function getUserSubscriptionStatus():
  Promise<'active' | 'canceled' | 'expired' | 'none'> {
  const r = await getSubscriptionDetails();
  if (!r.hasSubscription) return 'none';
  if (r.subscription?.status === 'active') return 'active';
  if (r.errorType === 'CANCELED') return 'canceled';
  if (r.errorType === 'EXPIRED') return 'expired';
  return 'none';
}
