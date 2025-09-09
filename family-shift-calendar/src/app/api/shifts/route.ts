import { NextRequest, NextResponse } from 'next/server';
import { getAllShifts, createShift } from '@/lib/database';

export async function GET() {
  try {
    const shifts = getAllShifts();
    return NextResponse.json(shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, startTime, endTime } = body;

    if (!userId || !title || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const shiftId = createShift(userId, title, startTime, endTime);
    return NextResponse.json({ id: shiftId, message: 'Shift created successfully' });
  } catch (error) {
    console.error('Error creating shift:', error);
    return NextResponse.json({ error: 'Failed to create shift' }, { status: 500 });
  }
}