import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
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

    const formattedSeasons = seasons.map(season => ({
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