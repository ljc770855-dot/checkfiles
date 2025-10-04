import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { services as servicesTable } from '@/drizzle/schema';

export async function GET() {
  try {
    const services = await db().select().from(servicesTable).all();
    
    return NextResponse.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch services' 
    }, { status: 500 });
  }
}
