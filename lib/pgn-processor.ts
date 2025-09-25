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
    
    // Check for valid player names (required for Lichess)
    const whiteMatch = pgnText.match(/\[White\s+"([^"]+)"\]/)
    const blackMatch = pgnText.match(/\[Black\s+"([^"]+)"\]/)
    
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
   */
  addBroadcastHeaders(pgn: string, gameInfo: GameInfo): string {
    // If the PGN is already complete and properly formatted, just update essential headers
    if (pgn && pgn.includes('[White') && pgn.includes('[Black') && pgn.length > 100) {
      // PGN already has proper formatting, just ensure it has the right broadcast headers
      let updatedPGN = pgn

      // Update/add essential broadcast headers
      updatedPGN = updatedPGN.replace(/\[Event\s+"[^"]*"\]/, `[Event "${gameInfo.event || 'Classical League'}"]`)
      updatedPGN = updatedPGN.replace(/\[Site\s+"[^"]*"\]/, `[Site "${gameInfo.site || 'Schachklub K4'}"]`)
      updatedPGN = updatedPGN.replace(/\[Date\s+"[^"]*"\]/, `[Date "${this.formatDate(gameInfo.roundDate)}"]`)
      updatedPGN = updatedPGN.replace(/\[Round\s+"[^"]*"\]/, `[Round "${gameInfo.roundNumber}"]`)
      updatedPGN = updatedPGN.replace(/\[Result\s+"[^"]*"\]/, `[Result "${gameInfo.result}"]`)

      // Add Board header if not present
      if (!updatedPGN.includes('[Board')) {
        const headerEnd = updatedPGN.indexOf('\n\n')
        if (headerEnd > 0) {
          const headers = updatedPGN.substring(0, headerEnd)
          const moves = updatedPGN.substring(headerEnd)
          updatedPGN = headers + `\n[Board "${gameInfo.boardNumber}"]` + moves
        }
      }

      return updatedPGN
    }

    // Fallback to old logic if PGN is incomplete
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
}