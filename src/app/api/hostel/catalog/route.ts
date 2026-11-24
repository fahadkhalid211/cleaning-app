import { NextResponse } from 'next/server';
import { route } from '@/lib/server/http';
import { getHostelAddons, listHostelRooms } from '@/lib/server/hostel';
import { getDepositPercentage, isPayPalConfigured } from '@/lib/server/paypal';

export const GET = route(async () => {
  const rooms = listHostelRooms();
  const addons = getHostelAddons();
  const depositPercent = getDepositPercentage();
  const paymentsEnabled = isPayPalConfigured();

  return NextResponse.json({
    rooms,
    addons,
    depositPercent,
    paymentsEnabled,
  });
});
