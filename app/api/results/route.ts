import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PGNFileService } from '@/lib/pgn-file-service'
import { PGNProcessor } from '@/lib/pgn-processor'
import { gameResultSubmissionSchema } from '@/lib/validations'
import { formatPlayerNameForPGN } from '@/lib/player-utils'

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

    const { roundId, boardNumber, result, whitePlayerId, blackPlayerId, winningPlayerId, pgn, forfeitReason } = validationResult.data

    // Verify white player exists
    const whitePlayer = await db.player.findUnique({
      where: { id: whitePlayerId }
    })

    if (!whitePlayer) {
      return NextResponse.json(
        { error: 'White player not found' },
        { status: 404 }
      )
    }

    // Verify black player exists
    const blackPlayer = await db.player.findUnique({
      where: { id: blackPlayerId }
    })

    if (!blackPlayer) {
      return NextResponse.json(
        { error: 'Black player not found' },
        { status: 404 }
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

    // Verify round exists and get season info
    const round = await db.round.findUnique({
      where: { id: roundId },
      include: {
        season: true
      }
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

    // Normalize PGN with all required headers using standard format
    let processedPGN = null
    if (pgn) {
      const pgnProcessor = new PGNProcessor()

      // Format player names in standard format: Firstname «Nickname» L.
      const whiteName = formatPlayerNameForPGN(whitePlayer.fullName, whitePlayer.nickname)
      const blackName = formatPlayerNameForPGN(blackPlayer.fullName, blackPlayer.nickname)

      // Extract moves from user's PGN (strips all headers)
      const moves = pgnProcessor.extractMoves(pgn)

      // Build standardized PGN with all required headers
      processedPGN = pgnProcessor.buildStandardPGN({
        whitePlayer: whiteName,
        blackPlayer: blackName,
        result: pgnProcessor.formatResult(result),
        boardNumber: boardNumber,
        roundNumber: round.roundNumber,
        roundDate: round.roundDate,
        event: `Classical League Season ${round.season.seasonNumber}`,
        site: 'Schachklub K4',
        moves: moves,
        whiteElo: whitePlayer.lichessRating,
        blackElo: blackPlayer.lichessRating
      })
    }

    // Create the game result
    const gameResult = await db.gameResult.create({
      data: {
        roundId: roundId,
        boardNumber: boardNumber,
        result: result,
        whitePlayerId: whitePlayerId,
        blackPlayerId: blackPlayerId,
        winningPlayerId: winningPlayerId || null,
        pgn: processedPGN,
        forfeitReason: forfeitReason ? forfeitReason.trim() : null,
        submittedDate: new Date(),
        isVerified: false
      }
    })

    // Invalidate cache and regenerate PGN for broadcast (async, don't wait for completion)
    const pgnService = new PGNFileService()

    // Clear any cached PGN data for this round to force fresh generation
    try {
      // Signal cache invalidation by making a HEAD request to the PGN endpoint
      // This ensures the next Lichess poll will get fresh data
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'

      fetch(`${baseUrl}/api/broadcast/round/${roundId}/pgn`, {
        method: 'HEAD',
        headers: { 'x-cache-invalidate': 'true' }
      }).catch(() => {
        // Ignore errors from cache invalidation
      })
    } catch {
      // Ignore URL construction errors
    }

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