import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/server/auth';
import { route } from '@/lib/server/http';

export const GET = route(async () => {
  return NextResponse.json({ user: await getSessionUser() });
});
