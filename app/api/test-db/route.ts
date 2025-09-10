import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Simple database connection test
    const result = await db.$queryRaw`SELECT 1 as test`
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Database connection successful',
      result
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}