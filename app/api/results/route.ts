import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PGNFileService } from '@/lib/pgn-file-service'
import { gameResultSubmissionSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input using Zod schema
    const validationResult = gameResultSubmissionSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    const { roundId, boardNumber, result, winningPlayerId, pgn, forfeitReason } = validationResult.data

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
        pgn: pgn ? pgn.trim() : null,
        forfeitReason: forfeitReason ? forfeitReason.trim() : null,
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