/**
 * PGN Processor for Lichess Broadcast Integration
 * Handles validation, formatting, and combination of PGN files for tournament broadcasts
 */

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
  whiteElo?: number
  blackElo?: number
}

export interface ProcessedPGN {
  isValid: boolean
  pgn: string
  gameCount: number
  errors: string[]
  lastUpdated: Date
}

export class PGNProcessor {
  /**
   * Validate PGN format for Lichess broadcast compatibility
   */
  validatePGN(pgnText: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!pgnText || pgnText.trim().length === 0) {
      errors.push('PGN is empty')
      return { isValid: false, errors }
    }
    
    // Check for required headers (Seven Tag Roster)
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
    
    // Check for valid result at end
    if (!pgnText.match(/1-0|0-1|1\/2-1\/2|\*$/m)) {
      errors.push('Missing or invalid game result at end of PGN')
    }
    
    // Check for valid player names (required for Lichess) - simplified regex for «» characters
    const whiteMatch = pgnText.match(/\[White\s+"([^"]+)"\]/)
    const blackMatch = pgnText.match(/\[Black\s+"([^"]+)"\]/)

    console.log('White match:', whiteMatch)
    console.log('Black match:', blackMatch)

    if (!whiteMatch || whiteMatch[1].trim() === '') {
      errors.push('White player name is required and cannot be empty')
    }

    if (!blackMatch || blackMatch[1].trim() === '') {
      errors.push('Black player name is required and cannot be empty')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Extract header information from PGN
   */
  extractGameHeaders(pgn: string): Record<string, string> {
    const headers: Record<string, string> = {}
    const lines = pgn.split('\n')
    
    for (const line of lines) {
      const match = line.match(/\[(\w+)\s+"([^"]+)"\]/)
      if (match) {
        headers[match[1]] = match[2]
      }
    }
    
    return headers
  }

  /**
   * Add required broadcast headers to PGN
   * This is now a simplified version since PGNs are normalized at submission time
   */
  addBroadcastHeaders(pgn: string, gameInfo: GameInfo): string {
    // PGNs from the database should already be properly formatted with all required headers
    // This function now just validates and returns the PGN as-is
    //
    // If for some reason the PGN is missing headers (old data), rebuild it
    if (!pgn || !pgn.includes('[White') || !pgn.includes('[Black')) {
      console.warn(`PGN for board ${gameInfo.boardNumber} missing headers, rebuilding...`)

      const moves = this.extractMoves(pgn)
      return this.buildStandardPGN({
        whitePlayer: gameInfo.whitePlayer,
        blackPlayer: gameInfo.blackPlayer,
        result: gameInfo.result,
        boardNumber: gameInfo.boardNumber,
        roundNumber: gameInfo.roundNumber,
        roundDate: gameInfo.roundDate,
        event: gameInfo.event || 'Classical League',
        site: gameInfo.site || 'Schachklub K4',
        moves: moves,
        whiteElo: gameInfo.whiteElo,
        blackElo: gameInfo.blackElo
      })
    }

    // PGN is already properly formatted, return as-is
    return pgn
  }

  /**
   * Format date for PGN (YYYY.MM.DD format)
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
  }

  /**
   * Combine multiple games into a single PGN file
   */
  combineGames(games: GameInfo[]): ProcessedPGN {
    const errors: string[] = []
    const pgnGames: string[] = []
    
    // Sort games by board number for consistent order (required by Lichess)
    const sortedGames = games.sort((a, b) => a.boardNumber - b.boardNumber)
    
    for (const game of sortedGames) {
      try {
        const processedPGN = this.addBroadcastHeaders(game.pgn, game)
        const validation = this.validatePGN(processedPGN)
        
        if (validation.isValid) {
          pgnGames.push(processedPGN)
        } else {
          // Log validation errors but include the game anyway for debugging
          console.error(`PGN validation failed for Board ${game.boardNumber}:`, validation.errors)
          errors.push(`Board ${game.boardNumber}: ${validation.errors.join(', ')}`)
          // Include the game anyway to see what's wrong
          pgnGames.push(processedPGN)
        }
      } catch (error) {
        errors.push(`Board ${game.boardNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

  /**
   * Format result enum to PGN standard format
   */
  formatResult(result: string): string {
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

  /**
   * Clean and normalize PGN text
   */
  cleanPGN(pgn: string): string {
    return pgn
      .trim()
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive blank lines
      .replace(/^\s+|\s+$/gm, '') // Trim whitespace from lines
  }

  /**
   * Extract only the moves from a PGN, removing all headers
   * This handles PGN with or without headers
   */
  extractMoves(pgn: string): string {
    if (!pgn || pgn.trim().length === 0) {
      return ''
    }

    const lines = pgn.trim().split('\n')
    const moveLines: string[] = []
    let inMoveSection = false

    for (const line of lines) {
      const trimmedLine = line.trim()

      // Skip header lines
      if (trimmedLine.startsWith('[')) {
        continue
      }

      // Empty line after headers marks start of moves
      if (trimmedLine === '' && !inMoveSection) {
        inMoveSection = true
        continue
      }

      // If we haven't hit the move section yet and line has move notation, we're in moves
      if (!inMoveSection && /\d+\./.test(trimmedLine)) {
        inMoveSection = true
      }

      // Collect move lines
      if (inMoveSection || /\d+\./.test(trimmedLine)) {
        moveLines.push(trimmedLine)
      }
    }

    // Join moves and clean up
    return moveLines.join(' ').trim()
  }

  /**
   * Build a complete, standardized PGN with all required headers
   * This ensures all PGNs stored in the database are uniform and valid
   */
  buildStandardPGN(params: {
    whitePlayer: string
    blackPlayer: string
    result: string
    boardNumber: number
    roundNumber: number
    roundDate: Date
    event: string
    site: string
    moves: string
    whiteElo?: number
    blackElo?: number
  }): string {
    const headers = [
      `[Event "${params.event}"]`,
      `[Site "${params.site}"]`,
      `[Date "${this.formatDate(params.roundDate)}"]`,
      `[Round "${params.roundNumber}"]`,
      `[Board "${params.boardNumber}"]`,
      `[White "${params.whitePlayer}"]`,
      `[Black "${params.blackPlayer}"]`,
      `[Result "${params.result}"]`
    ]

    // Add ELO ratings if provided
    if (params.whiteElo) {
      headers.push(`[WhiteElo "${params.whiteElo}"]`)
    }
    if (params.blackElo) {
      headers.push(`[BlackElo "${params.blackElo}"]`)
    }

    // Ensure moves end with result
    let moves = params.moves.trim()
    if (moves && !moves.match(/1-0|0-1|1\/2-1\/2|\*$/)) {
      moves += ` ${params.result}`
    } else if (!moves) {
      moves = params.result
    }

    // Build complete PGN
    return headers.join('\n') + '\n\n' + moves
  }
}