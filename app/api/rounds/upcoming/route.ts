import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get current active season
    const currentSeason = await db.season.findFirst({
      where: { isActive: true }
    })

    if (!currentSeason) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 })
    }

    // Get all upcoming rounds (rounds where the bye deadline hasn't passed)
    const now = new Date()
    
    const rounds = await db.round.findMany({
      where: {
        seasonId: currentSeason.id,
        roundDate: {
          gte: now // Only future rounds
        }
      },
      orderBy: {
        roundNumber: 'asc'
      }
    })

    // Add deadline status to each round
    const roundsWithStatus = rounds.map(round => ({
      id: round.id,
      roundNumber: round.roundNumber,
      roundDate: round.roundDate.toISOString(),
      byeDeadline: round.byeDeadline.toISOString(),
      isDeadlinePassed: now > round.byeDeadline
    }))

    return NextResponse.json(roundsWithStatus)
  } catch (error) {
    console.error('Error fetching upcoming rounds:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rounds' },
      { status: 500 }
    )
  }
}