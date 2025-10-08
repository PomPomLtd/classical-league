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

    // Get all rounds from the current season
    const allRounds = await db.round.findMany({
      where: {
        seasonId: currentSeason.id
      },
      orderBy: {
        roundNumber: 'asc'
      }
    })

    // Find the current round (the round that has started but next round hasn't started yet)
    // Allow result submission on the round date itself and until the next round starts
    let currentRoundIndex = -1
    for (let i = 0; i < allRounds.length; i++) {
      const roundDate = allRounds[i].roundDate
      const nextRoundDate = i < allRounds.length - 1
        ? allRounds[i + 1].roundDate
        : new Date(roundDate.getTime() + 14 * 24 * 60 * 60 * 1000)

      // Check if now is >= roundDate and <= nextRoundDate (inclusive of both dates)
      const roundDateOnly = new Date(roundDate.toDateString())
      const nextRoundDateOnly = new Date(nextRoundDate.toDateString())
      const nowDateOnly = new Date(now.toDateString())

      if (nowDateOnly >= roundDateOnly && nowDateOnly <= nextRoundDateOnly) {
        currentRoundIndex = i
        break
      }
    }

    // If we found a current round, return current round + all future rounds
    // Otherwise, return all future rounds
    const rounds = currentRoundIndex >= 0
      ? allRounds.slice(currentRoundIndex) // Current round onwards
      : allRounds.filter(r => {
          const roundDateOnly = new Date(r.roundDate.toDateString())
          const nowDateOnly = new Date(now.toDateString())
          return roundDateOnly >= nowDateOnly
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