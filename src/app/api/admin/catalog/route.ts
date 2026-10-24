import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { getCatalog } from '@/lib/server/catalog';
import { route } from '@/lib/server/http';

export const GET = route(async () => {
  await requireUser('admin');
  return NextResponse.json(getCatalog(true));
});
