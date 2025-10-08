import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch single game result with all relations
    const result = await db.gameResult.findUnique({
      where: { id },
      include: {
        round: {
          select: {
            id: true,
            roundNumber: true,
            roundDate: true
          }
        },
        submittedBy: {
          select: {
            id: true,
            fullName: true,
            nickname: true
          }
        },
        whitePlayer: {
          select: {
            id: true,
            fullName: true,
            nickname: true
          }
        },
        blackPlayer: {
          select: {
            id: true,
            fullName: true,
            nickname: true
          }
        },
        winningPlayer: {
          select: {
            id: true,
            fullName: true,
            nickname: true
          }
        }
      }
    })

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 })
    }

    // Format player names for display
    const formatPlayer = (player: { id: string; fullName: string; nickname: string } | null) => {
      if (!player) return null
      const nameParts = player.fullName.trim().split(' ')
      const firstName = nameParts[0]
      const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0).toUpperCase() + '.' : ''

      return {
        id: player.id,
        firstName,
        nickname: player.nickname,
        lastInitial,
        fullName: player.fullName
      }
    }

    const formattedResult = {
      id: result.id,
      boardNumber: result.boardNumber,
      result: result.result,
      pgn: result.pgn,
      forfeitReason: result.forfeitReason,
      submittedDate: result.submittedDate.toISOString(),
      isVerified: result.isVerified,
      verifiedDate: result.verifiedDate?.toISOString() || null,
      adminNotes: result.adminNotes,
      whitePlayerId: result.whitePlayerId,
      blackPlayerId: result.blackPlayerId,
      winningPlayerId: result.winningPlayerId,
      round: {
        id: result.round.id,
        roundNumber: result.round.roundNumber,
        roundDate: result.round.roundDate.toISOString()
      },
      submittedBy: formatPlayer(result.submittedBy),
      whitePlayer: formatPlayer(result.whitePlayer),
      blackPlayer: formatPlayer(result.blackPlayer),
      winningPlayer: formatPlayer(result.winningPlayer)
    }

    return NextResponse.json(formattedResult)
  } catch (error) {
    console.error('Error fetching result:', error)
    return NextResponse.json(
      { error: 'Failed to fetch result' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Verify result exists
    const existingResult = await db.gameResult.findUnique({
      where: { id }
    })

    if (!existingResult) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 })
    }

    // Validate business rules
    const isForfeit = ['WHITE_WIN_FF', 'BLACK_WIN_FF', 'DOUBLE_FF', 'DRAW_FF'].includes(body.result)
    const isDraw = ['DRAW', 'DOUBLE_FF', 'DRAW_FF'].includes(body.result)

    // Prepare update data with Prisma type
    const updateData: Prisma.GameResultUpdateInput = {
      boardNumber: body.boardNumber,
      result: body.result,
      adminNotes: body.adminNotes || null,
      // Handle PGN vs Forfeit Reason
      forfeitReason: isForfeit ? (body.forfeitReason || null) : null,
      pgn: !isForfeit ? (body.pgn || null) : null,
      // Handle player assignments
      whitePlayer: body.whitePlayerId ? { connect: { id: body.whitePlayerId } } : undefined,
      blackPlayer: body.blackPlayerId ? { connect: { id: body.blackPlayerId } } : undefined,
      // Handle winning player (null for draws)
      winningPlayer: isDraw
        ? { disconnect: true }
        : (body.winningPlayerId ? { connect: { id: body.winningPlayerId } } : undefined)
    }

    // Update the result
    const updatedResult = await db.gameResult.update({
      where: { id },
      data: updateData,
      include: {
        round: {
          select: {
            id: true,
            roundNumber: true,
            roundDate: true
          }
        },
        submittedBy: {
          select: {
            id: true,
            fullName: true,
            nickname: true
          }
        },
        whitePlayer: {
          select: {
            id: true,
            fullName: true,
            nickname: true
          }
        },
        blackPlayer: {
          select: {
            id: true,
            fullName: true,
            nickname: true
          }
        },
        winningPlayer: {
          select: {
            id: true,
            fullName: true,
            nickname: true
          }
        }
      }
    })

    // Format response
    const formatPlayer = (player: { id: string; fullName: string; nickname: string } | null) => {
      if (!player) return null
      const nameParts = player.fullName.trim().split(' ')
      const firstName = nameParts[0]
      const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0).toUpperCase() + '.' : ''

      return {
        id: player.id,
        firstName,
        nickname: player.nickname,
        lastInitial,
        fullName: player.fullName
      }
    }

    const formattedResult = {
      id: updatedResult.id,
      boardNumber: updatedResult.boardNumber,
      result: updatedResult.result,
      pgn: updatedResult.pgn,
      forfeitReason: updatedResult.forfeitReason,
      submittedDate: updatedResult.submittedDate.toISOString(),
      isVerified: updatedResult.isVerified,
      verifiedDate: updatedResult.verifiedDate?.toISOString() || null,
      adminNotes: updatedResult.adminNotes,
      whitePlayerId: updatedResult.whitePlayerId,
      blackPlayerId: updatedResult.blackPlayerId,
      winningPlayerId: updatedResult.winningPlayerId,
      round: {
        id: updatedResult.round.id,
        roundNumber: updatedResult.round.roundNumber,
        roundDate: updatedResult.round.roundDate.toISOString()
      },
      submittedBy: formatPlayer(updatedResult.submittedBy),
      whitePlayer: formatPlayer(updatedResult.whitePlayer),
      blackPlayer: formatPlayer(updatedResult.blackPlayer),
      winningPlayer: formatPlayer(updatedResult.winningPlayer)
    }

    return NextResponse.json(formattedResult)
  } catch (error) {
    console.error('Error updating result:', error)
    return NextResponse.json(
      { error: 'Failed to update result' },
      { status: 500 }
    )
  }
}
