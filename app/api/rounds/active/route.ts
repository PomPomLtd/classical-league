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

    // Get current and recent rounds (for result submission)
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const rounds = await db.round.findMany({
      where: {
        seasonId: currentSeason.id,
        // Allow submissions for current round and up to 1 week after round date
        roundDate: {
          gte: oneWeekAgo
        }
      },
      orderBy: {
        roundNumber: 'asc' // 1, 2, 3, 4, 5, 6, 7...
      }
    })

    const formattedRounds = rounds.map(round => ({
      id: round.id,
      roundNumber: round.roundNumber,
      roundDate: round.roundDate.toISOString()
    }))

    return NextResponse.json(formattedRounds)
  } catch (error) {
    console.error('Error fetching active rounds:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rounds' },
      { status: 500 }
    )
  }
}