import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/database';

export async function GET() {
  try {
    const users = getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, color } = body;

    if (!name || !color) {
      return NextResponse.json({ error: 'Name and color are required' }, { status: 400 });
    }

    const { createUser, getAllUsers } = await import('@/lib/database');
    
    // Check if user with this name already exists
    const existingUsers = getAllUsers();
    const existingUser = existingUsers.find(u => u.name.toLowerCase() === name.toLowerCase());
    
    if (existingUser) {
      return NextResponse.json({ id: existingUser.id, message: 'User already exists' });
    }
    
    // Generate unique email based on name and timestamp
    const timestamp = Date.now();
    const email = `${name.toLowerCase().replace(/\s+/g, '')}.${timestamp}@family.local`;
    const userId = createUser(name, email, 'temp123', color);
    
    return NextResponse.json({ id: userId, message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}