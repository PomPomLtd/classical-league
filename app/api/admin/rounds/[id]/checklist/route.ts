import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentSeason } from '@/lib/season'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roundId } = await params
    const season = await getCurrentSeason()

    if (!season) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 })
    }

    // Get round details
    const round = await db.round.findFirst({
      where: {
        id: roundId,
        seasonId: season.id
      }
    })

    if (!round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 })
    }

    // Get next round for bye deadline context
    const nextRound = await db.round.findFirst({
      where: {
        seasonId: season.id,
        roundNumber: round.roundNumber + 1
      }
    })

    // Count active players (approved and not withdrawn)
    const activePlayers = await db.player.count({
      where: {
        seasonId: season.id,
        isApproved: true,
        isWithdrawn: false
      }
    })

    // Count new registrations since last round (if not round 1)
    const newRegistrations = round.roundNumber > 1 ? await db.player.count({
      where: {
        seasonId: season.id,
        isApproved: true,
        approvedDate: {
          gte: new Date(round.roundDate.getTime() - (14 * 24 * 60 * 60 * 1000)) // 2 weeks before round date
        }
      }
    }) : 0

    // Count withdrawals since last round (if not round 1)
    const recentWithdrawals = round.roundNumber > 1 ? await db.player.count({
      where: {
        seasonId: season.id,
        isWithdrawn: true,
        withdrawalDate: {
          gte: new Date(round.roundDate.getTime() - (14 * 24 * 60 * 60 * 1000)) // 2 weeks before round date
        }
      }
    }) : 0

    // Count game results submitted for this round
    const submittedResults = await db.gameResult.count({
      where: {
        roundId: round.id
      }
    })

    // Count verified results for this round
    const verifiedResults = await db.gameResult.count({
      where: {
        roundId: round.id,
        isVerified: true
      }
    })

    // Count pending results (submitted but not verified)
    const pendingVerification = submittedResults - verifiedResults

    // Get bye requests for next round (if it exists)
    const nextRoundByeRequests = nextRound ? await db.byeRequest.findMany({
      where: {
        roundId: nextRound.id,
        player: {
          seasonId: season.id,
          isApproved: true,
          isWithdrawn: false
        }
      },
      include: {
        player: {
          select: {
            nickname: true,
            fullName: true
          }
        }
      },
      orderBy: {
        requestedDate: 'asc'
      }
    }) : []

    // Separate approved and pending bye requests
    const approvedByes = nextRoundByeRequests.filter((bye: typeof nextRoundByeRequests[0]) => bye.isApproved === true)
    const pendingByes = nextRoundByeRequests.filter((bye: typeof nextRoundByeRequests[0]) => bye.isApproved === null)
    const rejectedByes = nextRoundByeRequests.filter((bye: typeof nextRoundByeRequests[0]) => bye.isApproved === false)

    // Calculate expected number of games
    // Formula: (active players - byes) / 2, rounded down
    const playersForNextRound = activePlayers - approvedByes.length
    const expectedGames = Math.floor(playersForNextRound / 2)

    // Calculate completion percentage for current round
    const completionPercentage = expectedGames > 0 ? Math.round((verifiedResults / expectedGames) * 100) : 0

    return NextResponse.json({
      round: {
        id: round.id,
        roundNumber: round.roundNumber,
        roundDate: round.roundDate,
        byeDeadline: round.byeDeadline
      },
      nextRound: nextRound ? {
        id: nextRound.id,
        roundNumber: nextRound.roundNumber,
        roundDate: nextRound.roundDate,
        byeDeadline: nextRound.byeDeadline
      } : null,
      playerStats: {
        activePlayers,
        newRegistrations,
        recentWithdrawals
      },
      gameStats: {
        submittedResults,
        verifiedResults,
        pendingVerification,
        expectedGames,
        completionPercentage
      },
      byeRequests: {
        approved: approvedByes.map((bye: typeof approvedByes[0]) => ({
          id: bye.id,
          playerName: bye.player.nickname,
          fullName: bye.player.fullName,
          requestedDate: bye.requestedDate,
          approvedDate: bye.approvedDate
        })),
        pending: pendingByes.map((bye: typeof pendingByes[0]) => ({
          id: bye.id,
          playerName: bye.player.nickname,
          fullName: bye.player.fullName,
          requestedDate: bye.requestedDate
        })),
        rejected: rejectedByes.map((bye: typeof rejectedByes[0]) => ({
          id: bye.id,
          playerName: bye.player.nickname,
          fullName: bye.player.fullName,
          requestedDate: bye.requestedDate,
          adminNotes: bye.adminNotes
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching round checklist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}