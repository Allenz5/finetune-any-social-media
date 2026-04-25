import { NextResponse } from 'next/server';
import { disconnectLinkedIn } from '@/lib/browser/manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  await disconnectLinkedIn();
  return NextResponse.json({ ok: true });
}
