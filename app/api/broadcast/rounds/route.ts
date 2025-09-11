/**
 * Broadcast rounds endpoint - lists all rounds with PGN URLs
 * Useful for admin setup and testing
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PGNFileService } from '@/lib/pgn-file-service'

const pgnService = new PGNFileService()

export async function GET() {
  try {
    // Check if broadcast is enabled
    const settings = await pgnService.getBroadcastSettings()
    if (!settings.enabled) {
      return NextResponse.json(
        { error: 'Broadcast is disabled' },
        { status: 503 }
      )
    }
    
    // Get all rounds from current season
    const currentSeason = await db.season.findFirst({
      where: { isActive: true },
      include: {
        rounds: {
          include: {
            gameResults: {
              where: { isVerified: true },
              select: { id: true, boardNumber: true }
            }
          },
          orderBy: { roundNumber: 'asc' }
        }
      }
    })
    
    if (!currentSeason) {
      return NextResponse.json({ rounds: [] })
    }
    
    // Format round information for broadcast
    const rounds = await Promise.all(currentSeason.rounds.map(async round => ({
      id: round.id,
      roundNumber: round.roundNumber,
      roundDate: round.roundDate.toISOString(),
      gameCount: round.gameResults.length,
      pgnUrl: await pgnService.getRoundPGNUrl(round.id),
      lastUpdated: round.pgnUpdatedAt?.toISOString() || null,
      lichessBroadcastUrl: round.lichessBroadcastUrl || null
    })))
    
    return NextResponse.json({
      season: {
        id: currentSeason.id,
        name: currentSeason.name,
        seasonNumber: currentSeason.seasonNumber
      },
      rounds,
      settings: {
        broadcastEnabled: settings.enabled,
        baseUrl: settings.baseUrl,
        tournamentTemplate: settings.tournamentTemplate,
        roundTemplate: settings.roundTemplate
      }
    })
  } catch (error) {
    console.error('Error listing broadcast rounds:', error)
    return NextResponse.json(
      { error: 'Failed to list rounds' },
      { status: 500 }
    )
  }
}