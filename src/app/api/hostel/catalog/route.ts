import { NextResponse } from 'next/server';
import { route } from '@/lib/server/http';
import { getHostelAddons, listHostelRooms } from '@/lib/server/hostel';
import { getDepositPercentage, isPayPalConfigured, isPayPalLive } from '@/lib/server/paypal';

export const GET = route(async () => {
  const rooms = listHostelRooms();
  const addons = getHostelAddons();
  const depositPercent = getDepositPercentage();
  const paymentsEnabled = isPayPalConfigured();
  const isLive = isPayPalLive();

  return NextResponse.json({
    rooms,
    addons,
    depositPercent,
    paymentsEnabled,
    isLive,
  });
});
