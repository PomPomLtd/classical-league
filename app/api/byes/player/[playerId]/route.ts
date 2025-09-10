import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    const playerId = params.playerId

    // Get all bye requests for this player
    const byeRequests = await db.byeRequest.findMany({
      where: {
        playerId: playerId
      },
      select: {
        roundId: true,
        isApproved: true
      }
    })

    return NextResponse.json(byeRequests)
  } catch (error) {
    console.error('Error fetching player bye requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bye requests' },
      { status: 500 }
    )
  }
}