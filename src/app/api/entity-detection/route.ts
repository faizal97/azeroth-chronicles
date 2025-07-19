import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Entity detection is disabled - return empty entities for performance
    return NextResponse.json({ entities: [] });
  } catch (error) {
    console.error('Entity detection error:', error);
    return NextResponse.json({ entities: [] });
  }
}