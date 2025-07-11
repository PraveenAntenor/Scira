// lib/auth-utils.ts
import { auth } from '@/lib/auth';   // the BetterAuth handler
import { User } from '@/lib/db/schema';

/**
 * Return the BetterAuth session for this request
 * (or `null` if the user is not authenticated).
 */
export const getSession = async (request: Request) => {
  // call the handler exactly the way Next.js does
  const res = await auth(request);

  if (!res.ok) return null;                 // 401 / 403 → unauthenticated
  return (await res.json()) as
    | ({ user: User } & Record<string, unknown>)
    | null;
};

/** Convenience helper – just the user object (or `null`). */
export const getUser = async (request: Request) =>
  (await getSession(request))?.user ?? null;
