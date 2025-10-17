import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Check admin authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current active season with rounds
    const currentSeason = await db.season.findFirst({
      where: { isActive: true },
      include: {
        rounds: {
          orderBy: { roundNumber: 'asc' }
        }
      }
    })

    if (!currentSeason) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 })
    }

    // Format the response
    const formattedSeason = {
      id: currentSeason.id,
      seasonNumber: currentSeason.seasonNumber,
      name: currentSeason.name,
      rounds: currentSeason.rounds.map(round => ({
        id: round.id,
        roundNumber: round.roundNumber,
        roundDate: round.roundDate.toISOString(),
        byeDeadline: round.byeDeadline.toISOString()
      }))
    }

    return NextResponse.json(formattedSeason)
  } catch (error) {
    console.error('Error fetching current season:', error)
    return NextResponse.json(
      { error: 'Failed to fetch season' },
      { status: 500 }
    )
  }
}