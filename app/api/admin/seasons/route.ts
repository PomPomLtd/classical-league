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

    const seasons = await db.season.findMany({
      orderBy: { seasonNumber: 'desc' },
      include: {
        _count: {
          select: {
            players: true,
            rounds: true
          }
        }
      }
    })

    const formattedSeasons = seasons.map((season: typeof seasons[0]) => ({
      id: season.id,
      seasonNumber: season.seasonNumber,
      name: season.name,
      isActive: season.isActive,
      startDate: season.startDate.toISOString(),
      endDate: season.endDate.toISOString(),
      createdAt: season.createdAt.toISOString(),
      playerCount: season._count.players,
      roundCount: season._count.rounds
    }))

    return NextResponse.json(formattedSeasons)
  } catch (error) {
    console.error('Error fetching seasons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch seasons' },
      { status: 500 }
    )
  }
}