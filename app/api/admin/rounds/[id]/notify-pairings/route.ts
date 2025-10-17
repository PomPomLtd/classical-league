import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { sendNewRoundPairingsEmail, sendEmailSafe } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: roundId } = await params

    // Get round with all players and their pairings/byes
    const round = await db.round.findUnique({
      where: { id: roundId },
      include: {
        season: {
          include: {
            players: {
              where: {
                isApproved: true,
                isWithdrawn: false
              }
            }
          }
        },
        byeRequests: {
          where: {
            isApproved: true
          },
          include: {
            player: true
          }
        }
      }
    })

    if (!round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 })
    }

    // Get approved bye players for this round
    const byePlayers = new Set(round.byeRequests.map(bye => bye.player.id))

    // Send notifications to all approved players
    const emailPromises = round.season.players.map(player => {
      const hasBye = byePlayers.has(player.id)
      
      return sendEmailSafe(
        () => sendNewRoundPairingsEmail(
          player.email,
          player.fullName,
          round.roundNumber,
          round.roundDate,
          hasBye
        ),
        `round ${round.roundNumber} pairings notification for ${player.fullName}`
      )
    })

    // Wait for all emails to be processed
    await Promise.all(emailPromises)

    return NextResponse.json({
      success: true,
      message: `Round ${round.roundNumber} pairing notifications sent to ${round.season.players.length} players`,
      round: {
        id: round.id,
        roundNumber: round.roundNumber,
        roundDate: round.roundDate,
        playersNotified: round.season.players.length,
        byePlayersCount: byePlayers.size
      }
    })
  } catch (error) {
    console.error('Error sending round pairing notifications:', error)
    return NextResponse.json(
      { error: 'Failed to send pairing notifications' },
      { status: 500 }
    )
  }
}