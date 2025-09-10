import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { db } from '@/lib/db'

export async function POST(_request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Season 2 already exists
    const existingSeason = await db.season.findUnique({
      where: { seasonNumber: 2 }
    })

    if (existingSeason) {
      return NextResponse.json({ 
        message: 'Database already initialized',
        season: existingSeason 
      })
    }

    // Create Season 2
    const startDate = new Date('2025-09-23')
    const season = await db.season.create({
      data: {
        seasonNumber: 2,
        name: 'Season 2 - 2025',
        startDate: startDate,
        endDate: new Date('2025-12-15'),
        isActive: true,
        rounds: {
          create: Array.from({ length: 7 }, (_, i) => {
            const roundDate = new Date(startDate)
            roundDate.setDate(startDate.getDate() + (i * 14)) // Every 2 weeks
            
            const byeDeadline = new Date(roundDate)
            byeDeadline.setDate(roundDate.getDate() - 4) // Wednesday before (4 days)
            byeDeadline.setHours(12, 0, 0, 0) // Noon

            return {
              roundNumber: i + 1,
              roundDate: roundDate,
              byeDeadline: byeDeadline
            }
          })
        }
      },
      include: {
        rounds: true
      }
    })

    return NextResponse.json({ 
      message: 'Database initialized successfully',
      season: season,
      rounds: season.rounds.length
    })
  } catch (error) {
    console.error('Error initializing database:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    )
  }
}