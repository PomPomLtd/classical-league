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
    const lines = pgn.split('\n')
    const moves: string[] = []
    let inHeaders = true

    // Extract existing player names from PGN to preserve formatting if already correct
    const existingHeaders = this.extractGameHeaders(pgn)
    const existingWhite = existingHeaders['White']
    const existingBlack = existingHeaders['Black']

    // Use existing names if they're already in the correct format (contain quotes)
    let whitePlayer = gameInfo.whitePlayer
    let blackPlayer = gameInfo.blackPlayer

    if (existingWhite && existingWhite.includes('"') && existingWhite.includes('.')) {
      whitePlayer = existingWhite
    }
    if (existingBlack && existingBlack.includes('"') && existingBlack.includes('.')) {
      blackPlayer = existingBlack
    }

    // Separate headers from moves
    for (const line of lines) {
      if (line.trim().startsWith('[') && inHeaders) {
        // Skip existing headers, we'll regenerate them
        continue
      } else if (line.trim() === '' && inHeaders) {
        // Empty line might indicate end of headers
        continue
      } else {
        // Once we encounter a non-header line, we're in the moves section
        inHeaders = false
        // Add all remaining lines (including empty lines that separate moves)
        if (line.trim() !== '' || moves.length > 0) {
          moves.push(line)
        }
      }
    }
    
    // Create header map with required values
    const headerMap = new Map<string, string>()
    
    // Set required headers for Lichess broadcast
    headerMap.set('Event', gameInfo.event || 'Classical League')
    headerMap.set('Site', gameInfo.site || 'Schachklub K4')
    headerMap.set('Date', this.formatDate(gameInfo.roundDate))
    headerMap.set('Round', gameInfo.roundNumber.toString())
    headerMap.set('White', whitePlayer)
    headerMap.set('Black', blackPlayer)
    headerMap.set('Result', gameInfo.result)
    headerMap.set('Board', gameInfo.boardNumber.toString())
    
    // Add optional headers if available
    if (gameInfo.whiteElo) {
      headerMap.set('WhiteElo', gameInfo.whiteElo.toString())
    }
    if (gameInfo.blackElo) {
      headerMap.set('BlackElo', gameInfo.blackElo.toString())
    }
    
    // Generate header lines in the correct order
    const orderedHeaders = ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result', 'Board']
    const newHeaders = orderedHeaders.map(key => {
      const value = headerMap.get(key) || ''
      return `[${key} "${value}"]`
    })
    
    // Add any remaining headers not in the ordered list
    for (const [key, value] of headerMap) {
      if (!orderedHeaders.includes(key)) {
        newHeaders.push(`[${key} "${value}"]`)
      }
    }
    
    // Combine headers and moves
    const result = [...newHeaders, '', ...moves].join('\n')
    
    // Ensure the PGN ends with the result
    if (!result.endsWith(gameInfo.result)) {
      return result + ' ' + gameInfo.result
    }
    
    return result
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
          errors.push(`Board ${game.boardNumber}: ${validation.errors.join(', ')}`)
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