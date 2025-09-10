import { NextRequest, NextResponse } from 'next/server';
import { getTemplatesByUserId, createShiftTemplate } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const templates = getTemplatesByUserId(parseInt(userId));
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching shift templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, name, startTime, endTime } = await request.json();

    if (!userId || !name || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const templateId = createShiftTemplate(userId, name, startTime, endTime);
    return NextResponse.json({ id: templateId, message: 'Template created successfully' });
  } catch (error) {
    console.error('Error creating shift template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}