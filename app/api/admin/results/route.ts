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

    // Fetch all game results for current season
    const results = await db.gameResult.findMany({
      where: {
        round: {
          seasonId: currentSeason.id
        }
      },
      include: {
        round: {
          select: {
            id: true,
            roundNumber: true,
            roundDate: true
          }
        },
        winningPlayer: {
          select: {
            id: true,
            fullName: true,
            nickname: true
          }
        }
      },
      orderBy: [
        { isVerified: 'asc' }, // Unverified first
        { submittedDate: 'desc' } // Most recent first
      ]
    })

    // Format the response with player name parts for display
    const formattedResults = results.map((result: typeof results[0]) => {
      const formatPlayer = (player: { id: string; fullName: string; nickname: string } | null) => {
        if (!player) return null
        const nameParts = player.fullName.trim().split(' ')
        const firstName = nameParts[0]
        const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0).toUpperCase() + '.' : ''
        
        return {
          id: player.id,
          firstName,
          nickname: player.nickname,
          lastInitial
        }
      }

      return {
        id: result.id,
        boardNumber: result.boardNumber,
        result: result.result,
        pgn: result.pgn,
        forfeitReason: result.forfeitReason,
        submittedDate: result.submittedDate.toISOString(),
        isVerified: result.isVerified,
        verifiedDate: result.verifiedDate?.toISOString() || null,
        adminNotes: result.adminNotes,
        winningPlayerId: result.winningPlayerId,
        round: {
          id: result.round.id,
          roundNumber: result.round.roundNumber,
          roundDate: result.round.roundDate.toISOString()
        },
        winningPlayer: formatPlayer(result.winningPlayer)
      }
    })

    return NextResponse.json(formattedResults)
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    )
  }
}