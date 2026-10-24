import { NextResponse } from 'next/server';
import { endSession } from '@/lib/server/auth';
import { route } from '@/lib/server/http';

export const POST = route(async () => {
  await endSession();
  return NextResponse.json({ ok: true });
});
