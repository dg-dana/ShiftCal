import { NextRequest, NextResponse } from 'next/server';
import { updateShift, deleteShift } from '@/lib/database';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { title, startTime, endTime } = body;
    const { id } = await params;
    const shiftId = parseInt(id);

    if (!title || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    updateShift(shiftId, title, startTime, endTime);
    return NextResponse.json({ message: 'Shift updated successfully' });
  } catch (error) {
    console.error('Error updating shift:', error);
    return NextResponse.json({ error: 'Failed to update shift' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const shiftId = parseInt(id);
    deleteShift(shiftId);
    return NextResponse.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    console.error('Error deleting shift:', error);
    return NextResponse.json({ error: 'Failed to delete shift' }, { status: 500 });
  }
}