// app/api/auth/get-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
  const hdr = Object.fromEntries(await headers()) as HeadersInit;

  const authRes = await auth(new Request(req.url, { headers: hdr }));

  return new NextResponse(authRes.body, {
    status: authRes.status,
    headers: authRes.headers,
  });
}
