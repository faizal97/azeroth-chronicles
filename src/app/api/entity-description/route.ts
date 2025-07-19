import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { entity, type } = await request.json();

  if (!entity || !type) {
    return NextResponse.json({ error: 'Entity and type are required' }, { status: 400 });
  }

  if (!['person', 'place', 'thing'].includes(type)) {
    return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
  }

  try {
    // Since highlighting is disabled, return simple fallback descriptions
    // This endpoint is no longer needed for entity enhancement
    const fallbackDescriptions = {
      person: `Character or figure in the Warcraft universe.`,
      place: `Location in the world of Azeroth.`,
      thing: `Item, concept, or organization in Warcraft lore.`
    };
    
    const description = fallbackDescriptions[type as keyof typeof fallbackDescriptions] || 'An entity in the Warcraft universe.';

    return NextResponse.json({ description });

  } catch (error) {
    console.error('Entity description error:', error);
    
    return NextResponse.json({ 
      description: 'An entity in the Warcraft universe.'
    });
  }
}