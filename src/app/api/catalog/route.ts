import { NextResponse, connection } from 'next/server';
import { getCatalog } from '@/lib/server/catalog';
import { route } from '@/lib/server/http';
import { bookableWindow } from '@/lib/server/scheduling';

export const GET = route(async () => {
  await connection();
  return NextResponse.json({ ...getCatalog(), bookable: bookableWindow() });
});
