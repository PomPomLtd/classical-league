/**
 * Public PGN endpoint for Lichess broadcast integration
 * Serves PGN files that Lichess polls for tournament updates
 * Implements smart caching to reduce database load
 */

import { NextRequest, NextResponse } from 'next/server'
import { PGNFileService } from '@/lib/pgn-file-service'
import { db } from '@/lib/db'

const pgnService = new PGNFileService()

// In-memory cache for PGN data
const pgnCache = new Map<string, {
  pgn: string
  lastUpdated: Date
  gameCount: number
  lastModified: Date
  eTag: string
}>()

// Cache game result hashes to detect changes
const gameHashCache = new Map<string, string>()

async function getGameHash(roundId: string): Promise<string> {
  try {
    // Get all game results for this round with their update timestamps
    const results = await db.gameResult.findMany({
      where: { roundId },
      select: {
        id: true,
        submittedDate: true,
        pgn: true,
        result: true,
        boardNumber: true,
        isVerified: true
      },
      orderBy: { boardNumber: 'asc' }
    })

    // Create a hash based on all game data
    const dataString = results.map(r =>
      `${r.id}-${r.submittedDate?.getTime()}-${r.result}-${r.boardNumber}-${r.isVerified}-${r.pgn?.length || 0}`
    ).join('|')

    return Buffer.from(dataString).toString('base64')
  } catch {
    return Date.now().toString()
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roundId: string }> }
) {
  try {
    const { roundId } = await params

    if (!roundId) {
      return NextResponse.json(
        { error: 'Round ID is required' },
        { status: 400 }
      )
    }

    // Check if broadcast is enabled (light query)
    const settings = await pgnService.getBroadcastSettings()
    if (!settings.enabled) {
      return NextResponse.json(
        { error: 'Broadcast is disabled' },
        { status: 503 }
      )
    }

    // Check if games have changed since last cache
    const currentGameHash = await getGameHash(roundId)
    const cachedGameHash = gameHashCache.get(roundId)
    const cachedPGN = pgnCache.get(roundId)

    // If hash matches and we have cached PGN, serve from cache
    if (currentGameHash === cachedGameHash && cachedPGN) {
      console.log(`Serving cached PGN for round ${roundId}`)

      return new NextResponse(cachedPGN.pgn, {
        status: 200,
        headers: {
          'Content-Type': 'application/x-chess-pgn',
          'Cache-Control': 'public, max-age=60', // Longer cache since it's unchanged
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Last-Modified': cachedPGN.lastModified.toUTCString(),
          'ETag': cachedPGN.eTag,
          'X-Game-Count': cachedPGN.gameCount.toString(),
          'X-Round-Id': roundId,
          'X-Cache-Status': 'HIT',
          'Content-Length': Buffer.byteLength(cachedPGN.pgn, 'utf8').toString()
        }
      })
    }

    // Games have changed or no cache exists - regenerate
    console.log(`Regenerating PGN for round ${roundId} (cache ${cachedPGN ? 'STALE' : 'MISS'})`)
    const processedPGN = await pgnService.generateRoundPGN(roundId)
    
    console.log(`PGN generation result for round ${roundId}:`, {
      isValid: processedPGN.isValid,
      gameCount: processedPGN.gameCount,
      errors: processedPGN.errors,
      pgnLength: processedPGN.pgn.length
    })

    // Create ETag for this specific content
    const eTag = `"${Buffer.from(processedPGN.pgn).toString('base64').slice(-16)}"`

    if (!processedPGN.isValid) {
      console.error(`Invalid PGN for round ${roundId}:`, processedPGN.errors)

      // Don't cache invalid PGNs, return empty PGN
      const emptyPGN = [
        '[Event "Classical League"]',
        '[Site "Schachklub K4"]',
        '[Date "2025.09.11"]',
        '[Round "?"]',
        '[White "No games yet"]',
        '[Black "No games yet"]',
        '[Result "*"]',
        '',
        '*'
      ].join('\n')

      return new NextResponse(emptyPGN, {
        status: 200,
        headers: {
          'Content-Type': 'application/x-chess-pgn',
          'Cache-Control': 'public, max-age=30', // Short cache for invalid PGN
          'Access-Control-Allow-Origin': '*',
          'X-Error-Count': processedPGN.errors.length.toString(),
          'X-Cache-Status': 'INVALID'
        }
      })
    }

    // Cache the valid PGN
    const now = new Date()
    const cacheEntry = {
      pgn: processedPGN.pgn,
      lastUpdated: processedPGN.lastUpdated,
      gameCount: processedPGN.gameCount,
      lastModified: now,
      eTag
    }

    pgnCache.set(roundId, cacheEntry)
    gameHashCache.set(roundId, currentGameHash)

    console.log(`Cached PGN for round ${roundId} with ${processedPGN.gameCount} games`)

    // Return fresh PGN with cache info
    return new NextResponse(processedPGN.pgn, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-chess-pgn',
        'Cache-Control': 'public, max-age=30', // Shorter cache for fresh data
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Last-Modified': now.toUTCString(),
        'ETag': eTag,
        'X-Game-Count': processedPGN.gameCount.toString(),
        'X-Round-Id': roundId,
        'X-Cache-Status': 'MISS',
        'Content-Length': Buffer.byteLength(processedPGN.pgn, 'utf8').toString()
      }
    })
  } catch {
    console.error('Error serving PGN')
    
    // Return empty PGN instead of error for Lichess compatibility
    const errorPGN = [
      '[Event "Classical League"]',
      '[Site "Schachklub K4"]',
      '[Date "2025.09.11"]',
      '[Round "?"]',
      '[White "Error loading games"]',
      '[Black "Please try again later"]',
      '[Result "*"]',
      '',
      '*'
    ].join('\n')
    
    return new NextResponse(errorPGN, {
      status: 200, // Return 200 even on error for Lichess compatibility
      headers: {
        'Content-Type': 'application/x-chess-pgn',
        'Cache-Control': 'public, max-age=5',
        'Access-Control-Allow-Origin': '*',
        'X-Error': 'true'
      }
    })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400' // 24 hours
    }
  })
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ roundId: string }> }
) {
  try {
    const { roundId } = await params

    // Check for cache invalidation request
    const shouldInvalidate = request.headers.get('x-cache-invalidate') === 'true'
    if (shouldInvalidate) {
      console.log(`Cache invalidation requested for round ${roundId}`)
      pgnCache.delete(roundId)
      gameHashCache.delete(roundId)

      return new NextResponse(null, {
        status: 200,
        headers: {
          'X-Cache-Invalidated': 'true'
        }
      })
    }

    // Check if PGN file exists and get basic info
    const fileExists = await pgnService.pgnFileExists(roundId)
    const settings = await pgnService.getBroadcastSettings()

    if (!settings.enabled) {
      return new NextResponse(null, {
        status: 503,
        headers: {
          'X-Broadcast-Enabled': 'false'
        }
      })
    }

    const cached = pgnCache.get(roundId)
    return new NextResponse(null, {
      status: fileExists ? 200 : 404,
      headers: {
        'Content-Type': 'application/x-chess-pgn',
        'Cache-Control': 'public, max-age=10',
        'Access-Control-Allow-Origin': '*',
        'X-File-Exists': fileExists.toString(),
        'X-Broadcast-Enabled': 'true',
        'X-Cache-Status': cached ? 'CACHED' : 'EMPTY',
        ...(cached && {
          'Last-Modified': cached.lastModified.toUTCString(),
          'ETag': cached.eTag
        })
      }
    })
  } catch {
    return new NextResponse(null, {
      status: 500,
      headers: {
        'X-Error': 'true'
      }
    })
  }
}