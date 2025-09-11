import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PGNFileService } from '@/lib/pgn-file-service'

export async function POST(request: NextRequest) {
  try {
    const { roundId, boardNumber, result, winningPlayerId, pgn } = await request.json()

    // Validate input
    if (!roundId || !boardNumber || !result || !pgn) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (!Number.isInteger(boardNumber) || boardNumber < 1 || boardNumber > 100) {
      return NextResponse.json(
        { error: 'Board number must be between 1 and 100' },
        { status: 400 }
      )
    }

    const validResults = ['WHITE_WIN', 'BLACK_WIN', 'DRAW', 'WHITE_WIN_FF', 'BLACK_WIN_FF', 'DOUBLE_FF']
    if (!validResults.includes(result)) {
      return NextResponse.json(
        { error: 'Invalid result value' },
        { status: 400 }
      )
    }

    // Validate winning player for non-draw, non-double forfeit results
    const requiresWinner = !['DRAW', 'DOUBLE_FF'].includes(result)
    if (requiresWinner && !winningPlayerId) {
      return NextResponse.json(
        { error: 'Winning player is required for this result type' },
        { status: 400 }
      )
    }

    // Verify winning player exists if provided
    if (winningPlayerId) {
      const winningPlayer = await db.player.findUnique({
        where: { id: winningPlayerId }
      })

      if (!winningPlayer) {
        return NextResponse.json(
          { error: 'Winning player not found' },
          { status: 404 }
        )
      }
    }

    // Verify round exists
    const round = await db.round.findUnique({
      where: { id: roundId }
    })

    if (!round) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      )
    }

    // Check if result already exists for this round and board
    const existingResult = await db.gameResult.findUnique({
      where: {
        roundId_boardNumber: {
          roundId: roundId,
          boardNumber: boardNumber
        }
      }
    })

    if (existingResult) {
      return NextResponse.json(
        { error: `Result already exists for Round ${round.roundNumber}, Board ${boardNumber}` },
        { status: 400 }
      )
    }

    // Create the game result
    const gameResult = await db.gameResult.create({
      data: {
        roundId: roundId,
        boardNumber: boardNumber,
        result: result,
        winningPlayerId: winningPlayerId || null,
        pgn: pgn.trim(),
        submittedDate: new Date(),
        isVerified: false
      }
    })

    // Regenerate PGN for broadcast (async, don't wait for completion)
    const pgnService = new PGNFileService()
    pgnService.generateRoundPGN(roundId).catch(error => {
      console.error(`Failed to regenerate PGN for round ${roundId} after result submission:`, error)
    })

    return NextResponse.json({
      success: true,
      message: 'Result submitted successfully',
      resultId: gameResult.id
    })

  } catch (error) {
    console.error('Error submitting result:', error)
    return NextResponse.json(
      { error: 'Failed to submit result' },
      { status: 500 }
    )
  }
}