import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSeason } from '@/lib/season'

export async function GET() {
  try {
    const season = await getCurrentSeason()
    
    if (!season) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 })
    }

    // Count pending registrations (players not approved)
    const pendingRegistrations = await prisma.player.count({
      where: {
        seasonId: season.id,
        approved: false
      }
    })

    // Count pending bye requests (not approved)
    const pendingByeRequests = await prisma.byeRequest.count({
      where: {
        player: {
          seasonId: season.id
        },
        approved: false
      }
    })

    // Count pending results (not verified)
    const pendingResults = await prisma.gameResult.count({
      where: {
        round: {
          seasonId: season.id
        },
        verified: false
      }
    })

    return NextResponse.json({
      registrations: pendingRegistrations,
      byeRequests: pendingByeRequests,
      results: pendingResults
    })
  } catch (error) {
    console.error('Error fetching pending counts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}