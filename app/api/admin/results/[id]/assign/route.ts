import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { db } from '@/lib/db'
import { PGNFileService } from '@/lib/pgn-file-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: resultId } = await params
    const { whitePlayerId, blackPlayerId } = await request.json()

    if (!whitePlayerId || !blackPlayerId) {
      return NextResponse.json(
        { error: 'Both white and black player IDs are required' },
        { status: 400 }
      )
    }

    if (whitePlayerId === blackPlayerId) {
      return NextResponse.json(
        { error: 'White and black players cannot be the same' },
        { status: 400 }
      )
    }

    // Check if result exists
    const result = await db.gameResult.findUnique({
      where: { id: resultId }
    })

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 })
    }

    // Verify players exist
    const [whitePlayer, blackPlayer] = await Promise.all([
      db.player.findUnique({ where: { id: whitePlayerId } }),
      db.player.findUnique({ where: { id: blackPlayerId } })
    ])

    if (!whitePlayer || !blackPlayer) {
      return NextResponse.json({ error: 'One or both players not found' }, { status: 404 })
    }

    // Assign players to the result
    const updatedResult = await db.gameResult.update({
      where: { id: resultId },
      data: {
        whitePlayerId: whitePlayerId,
        blackPlayerId: blackPlayerId
      }
    })

    // Regenerate PGN for broadcast after player assignment (async, don't wait for completion)
    const pgnService = new PGNFileService()
    pgnService.generateRoundPGN(updatedResult.roundId).catch(error => {
      console.error(`Failed to regenerate PGN for round ${updatedResult.roundId} after player assignment:`, error)
    })

    return NextResponse.json({
      success: true,
      message: 'Players assigned successfully',
      result: updatedResult
    })
  } catch (error) {
    console.error('Error assigning players:', error)
    return NextResponse.json(
      { error: 'Failed to assign players' },
      { status: 500 }
    )
  }
}