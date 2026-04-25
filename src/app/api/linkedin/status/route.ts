import { NextResponse } from 'next/server';
import { getLinkedInStatus } from '@/lib/browser/manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const status = await getLinkedInStatus();
  return NextResponse.json(status);
}
