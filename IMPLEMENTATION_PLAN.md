# Lichess Broadcast Integration - Implementation Plan

## Overview
Implement automated Lichess broadcast integration using the Public URL approach where our system generates PGN files that Lichess polls for updates.

## Step-by-Step Implementation Plan

### Stage 1: Database Schema & Settings
**Goal**: Add database support for PGN file tracking and broadcast settings
**Success Criteria**: Database schema updated, admin can configure broadcast settings
**Tests**: Database migrations work, settings save/load correctly

#### 1.1 Database Migration
```sql
-- Add PGN tracking to rounds table
ALTER TABLE "public"."rounds" ADD COLUMN "pgn_file_path" VARCHAR(500);
ALTER TABLE "public"."rounds" ADD COLUMN "pgn_updated_at" TIMESTAMP;
ALTER TABLE "public"."rounds" ADD COLUMN "lichess_broadcast_url" VARCHAR(500);

-- Add broadcast settings
INSERT INTO "public"."admin_settings" ("key", "value", "description") VALUES
('broadcast_enabled', 'false', 'Enable/disable Lichess broadcast PGN generation'),
('broadcast_base_url', 'https://classical.schachklub-k4.ch', 'Base URL for PGN file access'),
('broadcast_tournament_template', 'Classical League Season {season}', 'Template for tournament names'),
('broadcast_round_template', 'Round {round}', 'Template for round names');
```

#### 1.2 Update Prisma Schema
```prisma
model Round {
  // existing fields...
  pgnFilePath        String?   @map("pgn_file_path")
  pgnUpdatedAt       DateTime? @map("pgn_updated_at")
  lichessBroadcastUrl String?  @map("lichess_broadcast_url")
}
```

### Stage 2: PGN Generation Service
**Goal**: Create service to generate valid PGN files from game results
**Success Criteria**: Can generate valid PGN from submitted results with proper headers
**Tests**: PGN validation, header generation, multi-game PGN creation

#### 2.1 PGN Processing Library
```typescript
// lib/pgn-processor.ts
interface GameInfo {
  boardNumber: number
  whitePlayer: string
  blackPlayer: string
  result: string
  pgn: string
  roundNumber: number
  roundDate: string
}

interface ProcessedPGN {
  isValid: boolean
  pgn: string
  gameCount: number
  errors: string[]
  lastUpdated: Date
}

class PGNProcessor {
  validatePGN(pgnText: string): { isValid: boolean; errors: string[] }
  extractGameHeaders(pgn: string): Record<string, string>
  addBroadcastHeaders(pgn: string, gameInfo: GameInfo): string
  combineGames(games: GameInfo[]): string
  formatForBroadcast(gameResults: GameResult[]): ProcessedPGN
}
```

#### 2.2 PGN File Service
```typescript
// lib/pgn-file-service.ts
class PGNFileService {
  generateRoundPGN(roundId: string): Promise<ProcessedPGN>
  saveRoundPGNFile(roundId: string, pgn: string): Promise<string>
  getRoundPGNUrl(roundId: string): string
  getPGNFilePath(roundId: string): string
  ensurePGNDirectory(): void
}
```

### Stage 3: Public PGN API Endpoint
**Goal**: Serve PGN files publicly for Lichess to poll
**Success Criteria**: Public endpoint returns valid PGN, proper cache headers, CORS support
**Tests**: Endpoint responds correctly, cache headers set, PGN format valid

#### 3.1 PGN API Route
```typescript
// app/api/broadcast/round/[roundId]/pgn/route.ts
export async function GET(request: Request, { params }: { params: { roundId: string } }) {
  // Generate and return round PGN
  // Set cache headers for Lichess polling
  // Handle CORS for cross-origin requests
}
```

#### 3.2 Static PGN File Serving
```typescript
// Option A: Generate and serve dynamically
// Option B: Generate static files and serve from public directory
// Choose dynamic for real-time updates
```

### Stage 4: Admin Interface Updates
**Goal**: Add broadcast configuration and PGN URL display to admin panel
**Success Criteria**: Admin can enable broadcasts, view PGN URLs, copy setup instructions
**Tests**: Settings save correctly, URLs display properly, copy functionality works

#### 4.1 Admin Settings Page Enhancement
```typescript
// app/admin/settings/page.tsx
// Add broadcast configuration section:
// - Enable/disable toggle
// - Base URL configuration
// - Tournament/round name templates
```

#### 4.2 Admin Rounds Page Enhancement
```typescript
// app/admin/rounds/page.tsx
// Add for each round:
// - PGN URL display
// - Copy to clipboard button
// - Lichess setup instructions
// - Broadcast status indicator
```

#### 4.3 Broadcast Setup Instructions Component
```typescript
// components/BroadcastSetupInstructions.tsx
// Step-by-step guide for setting up Lichess broadcast
// Include PGN URLs and QR codes
```

### Stage 5: Result Integration
**Goal**: Automatically regenerate PGN when results are submitted/verified
**Success Criteria**: PGN updates within seconds of result submission, no duplicate games
**Tests**: PGN regenerates on result changes, handles updates correctly

#### 5.1 Result Submission Hook
```typescript
// Modify app/api/results/route.ts
// After successful result submission:
// 1. Regenerate round PGN
// 2. Update pgn_updated_at timestamp
// 3. Log success/failure
```

#### 5.2 Admin Result Verification Hook
```typescript
// Modify app/api/admin/results/[id]/verify/route.ts
// After admin verifies result:
// 1. Regenerate round PGN
// 2. Include verified results only
// 3. Update broadcast file
```

### Stage 6: PGN Quality & Validation
**Goal**: Ensure all generated PGN meets Lichess broadcast requirements
**Success Criteria**: All PGN validates successfully, proper player names, correct headers
**Tests**: PGN validation passes, headers complete, game order consistent

#### 6.1 Player Name Resolution
```typescript
// Resolve board numbers to actual player names
// Use winning player + pairing logic to determine White/Black
// Fallback to "Player 1" / "Player 2" if names unavailable
```

#### 6.2 Header Tag Generation
```typescript
// Required headers: Event, Site, Date, Round, White, Black, Result
// Optional: WhiteElo, BlackElo, ECO, Opening, TimeControl, Board
// Template-based generation with proper formatting
```

### Stage 7: Testing & Validation
**Goal**: Test complete workflow with actual Lichess broadcast
**Success Criteria**: Results appear on Lichess broadcast within polling interval
**Tests**: End-to-end workflow, error handling, edge cases

#### 7.1 Manual Testing Workflow
```
1. Submit test result via admin panel
2. Verify PGN generates correctly at API endpoint
3. Configure Lichess broadcast to poll our URL
4. Confirm result appears on Lichess
5. Submit additional results and verify updates
```

#### 7.2 Error Handling & Logging
```typescript
// Comprehensive error logging for:
// - PGN generation failures
// - File system errors
// - Invalid game data
// - Missing player information
```

## Detailed Implementation Steps

### Step 1: Database Migration
```sql
-- Create migration file: 20250911_add_broadcast_support.sql
BEGIN;

-- Add PGN tracking columns to rounds table
ALTER TABLE "public"."rounds" ADD COLUMN "pgn_file_path" VARCHAR(500);
ALTER TABLE "public"."rounds" ADD COLUMN "pgn_updated_at" TIMESTAMP;
ALTER TABLE "public"."rounds" ADD COLUMN "lichess_broadcast_url" VARCHAR(500);

-- Add broadcast settings if admin_settings table exists
INSERT INTO "public"."admin_settings" ("key", "value", "description") VALUES
('broadcast_enabled', 'false', 'Enable/disable Lichess broadcast PGN generation'),
('broadcast_base_url', 'https://classical.schachklub-k4.ch', 'Base URL for PGN file access'),
('broadcast_tournament_template', 'Classical League Season {season}', 'Template for tournament names'),
('broadcast_round_template', 'Round {round}', 'Template for round names')
ON CONFLICT ("key") DO NOTHING;

COMMIT;
```

### Step 2: Prisma Schema Update
```prisma
model Round {
  id                   String    @id @default(cuid())
  seasonId             String    @map("season_id")
  roundNumber          Int       @map("round_number")
  roundDate            DateTime  @map("round_date")
  byeDeadline          DateTime  @map("bye_deadline")
  pgnFilePath          String?   @map("pgn_file_path")
  pgnUpdatedAt         DateTime? @map("pgn_updated_at")
  lichessBroadcastUrl  String?   @map("lichess_broadcast_url")
  
  season               Season    @relation(fields: [seasonId], references: [id], onDelete: Cascade)
  byeRequests          ByeRequest[]
  gameResults          GameResult[]
  
  @@unique([seasonId, roundNumber])
  @@map("rounds")
}
```

### Step 3: PGN Processor Implementation
```typescript
// lib/pgn-processor.ts
export interface GameInfo {
  boardNumber: number
  whitePlayer: string
  blackPlayer: string
  result: string
  pgn: string
  roundNumber: number
  roundDate: Date
  event?: string
  site?: string
}

export interface ProcessedPGN {
  isValid: boolean
  pgn: string
  gameCount: number
  errors: string[]
  lastUpdated: Date
}

export class PGNProcessor {
  validatePGN(pgnText: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Check for required headers
    const requiredHeaders = ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result']
    for (const header of requiredHeaders) {
      if (!pgnText.includes(`[${header}`)) {
        errors.push(`Missing required header: ${header}`)
      }
    }
    
    // Check for balanced brackets
    const openBrackets = (pgnText.match(/\[/g) || []).length
    const closeBrackets = (pgnText.match(/\]/g) || []).length
    if (openBrackets !== closeBrackets) {
      errors.push('Unbalanced brackets in PGN')
    }
    
    // Check for result tag at end
    if (!pgnText.match(/1-0|0-1|1\/2-1\/2|\*/)) {
      errors.push('Missing game result at end of PGN')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  addBroadcastHeaders(pgn: string, gameInfo: GameInfo): string {
    const lines = pgn.split('\n')
    const headers: string[] = []
    const moves: string[] = []
    let inHeaders = true
    
    // Separate headers from moves
    for (const line of lines) {
      if (line.trim().startsWith('[') && inHeaders) {
        headers.push(line)
      } else if (line.trim() && !line.startsWith('[')) {
        inHeaders = false
        moves.push(line)
      }
    }
    
    // Add/update required headers
    const headerMap = new Map<string, string>()
    
    // Parse existing headers
    for (const header of headers) {
      const match = header.match(/\[(\w+)\s+"([^"]+)"\]/)
      if (match) {
        headerMap.set(match[1], match[2])
      }
    }
    
    // Set required headers
    headerMap.set('Event', gameInfo.event || 'Classical League')
    headerMap.set('Site', gameInfo.site || 'Schachklub K4')
    headerMap.set('Date', gameInfo.roundDate.toISOString().split('T')[0].replace(/-/g, '.'))
    headerMap.set('Round', gameInfo.roundNumber.toString())
    headerMap.set('White', gameInfo.whitePlayer)
    headerMap.set('Black', gameInfo.blackPlayer)
    headerMap.set('Result', gameInfo.result)
    headerMap.set('Board', gameInfo.boardNumber.toString())
    
    // Generate header lines
    const orderedHeaders = ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result', 'Board']
    const newHeaders = orderedHeaders.map(key => `[${key} "${headerMap.get(key)}"]`)
    
    // Add any remaining headers not in the ordered list
    for (const [key, value] of headerMap) {
      if (!orderedHeaders.includes(key)) {
        newHeaders.push(`[${key} "${value}"]`)
      }
    }
    
    return [...newHeaders, '', ...moves].join('\n')
  }

  combineGames(games: GameInfo[]): ProcessedPGN {
    const errors: string[] = []
    const pgnGames: string[] = []
    
    // Sort games by board number for consistent order
    const sortedGames = games.sort((a, b) => a.boardNumber - b.boardNumber)
    
    for (const game of sortedGames) {
      try {
        const processedPGN = this.addBroadcastHeaders(game.pgn, game)
        const validation = this.validatePGN(processedPGN)
        
        if (validation.isValid) {
          pgnGames.push(processedPGN)
        } else {
          errors.push(`Board ${game.boardNumber}: ${validation.errors.join(', ')}`)
        }
      } catch (error) {
        errors.push(`Board ${game.boardNumber}: ${error.message}`)
      }
    }
    
    const combinedPGN = pgnGames.join('\n\n')
    
    return {
      isValid: errors.length === 0,
      pgn: combinedPGN,
      gameCount: pgnGames.length,
      errors,
      lastUpdated: new Date()
    }
  }
}
```

### Step 4: PGN File Service
```typescript
// lib/pgn-file-service.ts
import fs from 'fs/promises'
import path from 'path'
import { PGNProcessor, ProcessedPGN, GameInfo } from './pgn-processor'
import { db } from './db'

export class PGNFileService {
  private pgnProcessor = new PGNProcessor()
  private pgnDirectory = path.join(process.cwd(), 'public', 'pgn')
  
  async ensurePGNDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.pgnDirectory, { recursive: true })
    } catch (error) {
      console.error('Failed to create PGN directory:', error)
    }
  }
  
  getPGNFilePath(roundId: string): string {
    return path.join(this.pgnDirectory, `round-${roundId}.pgn`)
  }
  
  getRoundPGNUrl(roundId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    return `${baseUrl}/api/broadcast/round/${roundId}/pgn`
  }
  
  async generateRoundPGN(roundId: string): Promise<ProcessedPGN> {
    try {
      // Fetch round and verified results
      const round = await db.round.findUnique({
        where: { id: roundId },
        include: {
          season: true,
          gameResults: {
            where: { isVerified: true },
            include: {
              whitePlayer: true,
              blackPlayer: true
            }
          }
        }
      })
      
      if (!round) {
        throw new Error(`Round ${roundId} not found`)
      }
      
      // Convert game results to GameInfo format
      const games: GameInfo[] = round.gameResults.map(result => ({
        boardNumber: result.boardNumber,
        whitePlayer: result.whitePlayer?.fullName || 'Unknown Player',
        blackPlayer: result.blackPlayer?.fullName || 'Unknown Player',
        result: this.formatResult(result.result),
        pgn: result.pgn,
        roundNumber: round.roundNumber,
        roundDate: round.roundDate,
        event: `Classical League Season ${round.season.seasonNumber}`,
        site: 'Schachklub K4'
      }))
      
      // Generate combined PGN
      const processedPGN = this.pgnProcessor.combineGames(games)
      
      if (processedPGN.isValid) {
        // Save to file and update database
        await this.saveRoundPGNFile(roundId, processedPGN.pgn)
        await db.round.update({
          where: { id: roundId },
          data: {
            pgnUpdatedAt: new Date()
          }
        })
      }
      
      return processedPGN
    } catch (error) {
      console.error(`Failed to generate PGN for round ${roundId}:`, error)
      return {
        isValid: false,
        pgn: '',
        gameCount: 0,
        errors: [error.message],
        lastUpdated: new Date()
      }
    }
  }
  
  async saveRoundPGNFile(roundId: string, pgn: string): Promise<string> {
    await this.ensurePGNDirectory()
    const filePath = this.getPGNFilePath(roundId)
    await fs.writeFile(filePath, pgn, 'utf8')
    
    // Update database with file path
    await db.round.update({
      where: { id: roundId },
      data: {
        pgnFilePath: filePath,
        pgnUpdatedAt: new Date()
      }
    })
    
    return filePath
  }
  
  private formatResult(result: string): string {
    // Convert our result format to standard PGN format
    const resultMap: Record<string, string> = {
      'WHITE_WIN': '1-0',
      'BLACK_WIN': '0-1',
      'DRAW': '1/2-1/2',
      'WHITE_WIN_FF': '1-0',
      'BLACK_WIN_FF': '0-1',
      'DOUBLE_FF': '1/2-1/2'
    }
    
    return resultMap[result] || '1/2-1/2'
  }
}
```

### Step 5: Public PGN API Endpoint
```typescript
// app/api/broadcast/round/[roundId]/pgn/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PGNFileService } from '@/lib/pgn-file-service'

const pgnService = new PGNFileService()

export async function GET(
  request: NextRequest,
  { params }: { params: { roundId: string } }
) {
  try {
    const { roundId } = params
    
    // Generate latest PGN for the round
    const processedPGN = await pgnService.generateRoundPGN(roundId)
    
    if (!processedPGN.isValid) {
      return NextResponse.json(
        { error: 'Invalid PGN', errors: processedPGN.errors },
        { status: 400 }
      )
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
        'X-Game-Count': processedPGN.gameCount.toString()
      }
    })
  } catch (error) {
    console.error('Error serving PGN:', error)
    return NextResponse.json(
      { error: 'Failed to generate PGN' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
```

## Ready to Start Implementation!

This plan provides:
- ✅ **Clear 7-stage progression** from database to testing
- ✅ **Detailed code examples** for each component
- ✅ **Success criteria** for each stage
- ✅ **Public URL approach** (no OAuth complexity)
- ✅ **Test-ready structure** for your Lichess broadcast

Let's start with **Stage 1: Database Migration**!