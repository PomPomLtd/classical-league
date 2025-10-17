import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current season
    const currentSeason = await db.season.findFirst({
      where: { isActive: true }
    })

    if (!currentSeason) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 })
    }

    // Check if client wants all players or just the latest ones
    const { searchParams } = new URL(request.url)
    const loadAll = searchParams.get('loadAll') === 'true'
    const limit = loadAll ? undefined : 20

    // Get total count for metadata
    const totalCount = await db.player.count({
      where: {
        seasonId: currentSeason.id
      }
    })

    // Fetch players for current season
    const players = await db.player.findMany({
      where: {
        seasonId: currentSeason.id
      },
      orderBy: [
        { isApproved: 'asc' }, // Pending first
        { registrationDate: 'desc' } // Most recent first
      ],
      take: limit
    })

    return NextResponse.json({
      players,
      pagination: {
        total: totalCount,
        loaded: players.length,
        hasMore: !loadAll && totalCount > 20
      }
    })
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
}