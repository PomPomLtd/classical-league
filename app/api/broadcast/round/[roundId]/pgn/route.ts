/**
 * Public PGN endpoint for Lichess broadcast integration
 * Serves PGN files that Lichess polls for tournament updates
 */

import { NextRequest, NextResponse } from 'next/server'
import { PGNFileService } from '@/lib/pgn-file-service'

const pgnService = new PGNFileService()

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
    
    // Check if broadcast is enabled
    const settings = await pgnService.getBroadcastSettings()
    if (!settings.enabled) {
      return NextResponse.json(
        { error: 'Broadcast is disabled' },
        { status: 503 }
      )
    }
    
    // Generate latest PGN for the round
    const processedPGN = await pgnService.generateRoundPGN(roundId)
    
    console.log(`PGN generation result for round ${roundId}:`, {
      isValid: processedPGN.isValid,
      gameCount: processedPGN.gameCount,
      errors: processedPGN.errors,
      pgnLength: processedPGN.pgn.length
    })
    
    if (!processedPGN.isValid) {
      console.error(`Invalid PGN for round ${roundId}:`, processedPGN.errors)
      
      // Return empty PGN instead of error for Lichess compatibility
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
          'Cache-Control': 'public, max-age=30',
          'Access-Control-Allow-Origin': '*',
          'X-Error-Count': processedPGN.errors.length.toString()
        }
      })
    }
    
    // Return PGN with appropriate headers for Lichess polling
    return new NextResponse(processedPGN.pgn, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-chess-pgn',
        'Cache-Control': 'public, max-age=10', // 10 second cache for Lichess polling
        'Access-Control-Allow-Origin': '*', // Allow Lichess to access
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Last-Modified': processedPGN.lastUpdated.toUTCString(),
        'X-Game-Count': processedPGN.gameCount.toString(),
        'X-Round-Id': roundId,
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
    
    return new NextResponse(null, {
      status: fileExists ? 200 : 404,
      headers: {
        'Content-Type': 'application/x-chess-pgn',
        'Cache-Control': 'public, max-age=10',
        'Access-Control-Allow-Origin': '*',
        'X-File-Exists': fileExists.toString(),
        'X-Broadcast-Enabled': 'true'
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