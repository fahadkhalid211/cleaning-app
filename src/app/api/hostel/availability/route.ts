import { NextResponse } from 'next/server';
import { HttpError, route } from '@/lib/server/http';
import { getHostelBeds, getHostelRoom } from '@/lib/server/hostel';

export const GET = route(async (req) => {
  const url = new URL(req.url);
  const roomId = url.searchParams.get('roomId');
  if (!roomId) throw new HttpError(400, 'Missing roomId query parameter.');

  const checkIn = url.searchParams.get('checkIn') || undefined;
  const checkOut = url.searchParams.get('checkOut') || undefined;

  const room = getHostelRoom(roomId);
  if (!room) throw new HttpError(404, 'Room not found.');

  const beds = getHostelBeds(roomId, checkIn, checkOut);

  return NextResponse.json({
    room,
    beds,
    totalBeds: beds.length,
    availableBeds: beds.filter((b) => b.isAvailable).length,
  });
});
