import { NextRequest, NextResponse } from 'next/server';
import { deleteShiftTemplate } from '@/lib/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = parseInt(params.id);
    
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 });
    }

    deleteShiftTemplate(templateId);
    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting shift template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}