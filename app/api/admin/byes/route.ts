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

    // Get current season
    const currentSeason = await db.season.findFirst({
      where: { isActive: true }
    })

    if (!currentSeason) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 })
    }

    // Fetch all bye requests for current season
    const byeRequests = await db.byeRequest.findMany({
      where: {
        player: {
          seasonId: currentSeason.id
        }
      },
      include: {
        player: {
          select: {
            id: true,
            fullName: true,
            nickname: true
          }
        },
        round: {
          select: {
            id: true,
            roundNumber: true,
            roundDate: true,
            byeDeadline: true
          }
        }
      },
      orderBy: [
        { isApproved: 'asc' }, // Pending first (null values first)
        { requestedDate: 'desc' } // Most recent first
      ]
    })

    // Format the response with player name parts for display
    const formattedRequests = byeRequests.map(request => {
      const nameParts = request.player.fullName.trim().split(' ')
      const firstName = nameParts[0]
      const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0).toUpperCase() + '.' : ''
      
      return {
        id: request.id,
        requestedDate: request.requestedDate.toISOString(),
        isApproved: request.isApproved,
        approvedDate: request.approvedDate?.toISOString() || null,
        adminNotes: request.adminNotes,
        player: {
          id: request.player.id,
          firstName,
          nickname: request.player.nickname,
          lastInitial,
          fullName: request.player.fullName
        },
        round: request.round ? {
          id: request.round.id,
          roundNumber: request.round.roundNumber,
          roundDate: request.round.roundDate.toISOString(),
          byeDeadline: request.round.byeDeadline.toISOString()
        } : null
      }
    })

    return NextResponse.json(formattedRequests)
  } catch (error) {
    console.error('Error fetching bye requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bye requests' },
      { status: 500 }
    )
  }
}