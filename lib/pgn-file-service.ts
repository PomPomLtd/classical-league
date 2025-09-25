/**
 * PGN File Service for Lichess Broadcast Integration
 * Handles generation, storage, and serving of PGN files for tournament rounds
 */

import fs from 'fs/promises'
import path from 'path'
import { PGNProcessor, ProcessedPGN, GameInfo } from './pgn-processor'
import { db } from './db'
import { formatPlayerNameForPGN } from './player-utils'

export class PGNFileService {
  private pgnProcessor = new PGNProcessor()
  private pgnDirectory = path.join(process.cwd(), 'public', 'pgn')
  
  /**
   * Ensure PGN directory exists
   */
  async ensurePGNDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.pgnDirectory, { recursive: true })
    } catch (error) {
      console.error('Failed to create PGN directory:', error)
      throw new Error('Could not create PGN directory')
    }
  }
  
  /**
   * Get file system path for round PGN file
   */
  getPGNFilePath(roundId: string): string {
    return path.join(this.pgnDirectory, `round-${roundId}.pgn`)
  }
  
  /**
   * Get public URL for round PGN file (for Lichess polling)
   */
  async getRoundPGNUrl(roundId: string): Promise<string> {
    const settings = await this.getBroadcastSettings()
    return `${settings.baseUrl}/api/broadcast/round/${roundId}/pgn`
  }
  
  /**
   * Generate PGN for a tournament round from verified game results
   */
  async generateRoundPGN(roundId: string): Promise<ProcessedPGN> {
    try {
      // Fetch round and verified results with player information
      const round = await db.round.findUnique({
        where: { id: roundId },
        include: {
          season: true,
          gameResults: {
            where: { isVerified: true },
            include: {
              whitePlayer: true,
              blackPlayer: true,
              winningPlayer: true
            },
            orderBy: { boardNumber: 'asc' }
          }
        }
      })
      
      if (!round) {
        throw new Error(`Round ${roundId} not found`)
      }
      
      // Convert game results to GameInfo format
      const games: GameInfo[] = []
      
      for (const result of round.gameResults) {
        // Determine player names - use properly formatted names from the database
        let whitePlayer = 'Unknown Player'
        let blackPlayer = 'Unknown Player'

        if (result.whitePlayer && result.blackPlayer) {
          // Use formatted names for broadcast
          whitePlayer = formatPlayerNameForPGN(result.whitePlayer.fullName, result.whitePlayer.nickname)
          blackPlayer = formatPlayerNameForPGN(result.blackPlayer.fullName, result.blackPlayer.nickname)
        } else if (result.winningPlayer) {
          // Use winning player to determine assignment (fallback for old data)
          if (this.isWhiteWin(result.result)) {
            whitePlayer = formatPlayerNameForPGN(result.winningPlayer.fullName, result.winningPlayer.nickname)
            blackPlayer = 'Opponent'
          } else if (this.isBlackWin(result.result)) {
            blackPlayer = formatPlayerNameForPGN(result.winningPlayer.fullName, result.winningPlayer.nickname)
            whitePlayer = 'Opponent'
          } else {
            // Draw - can't determine who's who, use generic names
            whitePlayer = `Player (Board ${result.boardNumber})`
            blackPlayer = `Opponent (Board ${result.boardNumber})`
          }
        } else {
          // No player information available
          whitePlayer = `White (Board ${result.boardNumber})`
          blackPlayer = `Black (Board ${result.boardNumber})`
        }

        const gameInfo: GameInfo = {
          boardNumber: result.boardNumber,
          whitePlayer,
          blackPlayer,
          result: this.pgnProcessor.formatResult(result.result),
          pgn: result.pgn ? this.pgnProcessor.cleanPGN(result.pgn) : '',
          roundNumber: round.roundNumber,
          roundDate: round.roundDate,
          event: `Classical League Season ${round.season.seasonNumber}`,
          site: 'Schachklub K4'
        }
        
        games.push(gameInfo)
      }
      
      if (games.length === 0) {
        return {
          isValid: true,
          pgn: this.generateEmptyRoundPGN(round),
          gameCount: 0,
          errors: [],
          lastUpdated: new Date()
        }
      }
      
      // Generate combined PGN
      const processedPGN = this.pgnProcessor.combineGames(games)
      
      if (processedPGN.isValid && processedPGN.pgn.trim()) {
        // Update database timestamp (skip file saving for serverless)
        await this.updateRoundPGNTimestamp(roundId)
      }
      
      return processedPGN
    } catch (error) {
      console.error(`Failed to generate PGN for round ${roundId}:`, error)
      return {
        isValid: false,
        pgn: '',
        gameCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        lastUpdated: new Date()
      }
    }
  }
  
  /**
   * Save PGN content to file system
   */
  async saveRoundPGNFile(roundId: string, pgn: string): Promise<string> {
    await this.ensurePGNDirectory()
    const filePath = this.getPGNFilePath(roundId)
    await fs.writeFile(filePath, pgn, 'utf8')
    
    // Update database with file path
    await db.round.update({
      where: { id: roundId },
      data: {
        pgnFilePath: filePath
      }
    })
    
    return filePath
  }
  
  /**
   * Update round PGN timestamp in database
   */
  async updateRoundPGNTimestamp(roundId: string): Promise<void> {
    await db.round.update({
      where: { id: roundId },
      data: {
        pgnUpdatedAt: new Date()
      }
    })
  }
  
  /**
   * Generate empty PGN for rounds with no results yet
   */
  private generateEmptyRoundPGN(round: { roundNumber: number; roundDate: Date; season: { seasonNumber: number } }): string {
    const headers = [
      `[Event "Classical League Season ${round.season.seasonNumber}"]`,
      `[Site "Schachklub K4"]`,
      `[Date "${this.formatDate(round.roundDate)}"]`,
      `[Round "${round.roundNumber}"]`,
      `[White "No games yet"]`,
      `[Black "No games yet"]`,
      `[Result "*"]`,
      ''
    ]
    
    return headers.join('\n') + '*'
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
   * Check if result indicates white won
   */
  private isWhiteWin(result: string): boolean {
    return result === 'WHITE_WIN' || result === 'WHITE_WIN_FF'
  }
  
  /**
   * Check if result indicates black won
   */
  private isBlackWin(result: string): boolean {
    return result === 'BLACK_WIN' || result === 'BLACK_WIN_FF'
  }
  
  /**
   * Get PGN file content from file system
   */
  async readRoundPGNFile(roundId: string): Promise<string | null> {
    try {
      const filePath = this.getPGNFilePath(roundId)
      const content = await fs.readFile(filePath, 'utf8')
      return content
    } catch {
      // File doesn't exist or other error - return null
      return null
    }
  }
  
  /**
   * Check if PGN file exists for round
   */
  async pgnFileExists(roundId: string): Promise<boolean> {
    try {
      const filePath = this.getPGNFilePath(roundId)
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }
  
  /**
   * Delete PGN file for round
   */
  async deleteRoundPGNFile(roundId: string): Promise<void> {
    try {
      const filePath = this.getPGNFilePath(roundId)
      await fs.unlink(filePath)
      
      // Clear file path in database
      await db.round.update({
        where: { id: roundId },
        data: {
          pgnFilePath: null,
          pgnUpdatedAt: null
        }
      })
    } catch {
      // File deletion failed - not critical, just log
      console.error(`Failed to delete PGN file for round ${roundId}`)
    }
  }
  
  /**
   * Get broadcast settings from admin settings
   */
  async getBroadcastSettings(): Promise<{
    enabled: boolean
    baseUrl: string
    tournamentTemplate: string
    roundTemplate: string
  }> {
    try {
      const settings = await db.adminSettings.findMany({
        where: {
          key: {
            in: ['broadcast_enabled', 'broadcast_base_url', 'broadcast_tournament_template', 'broadcast_round_template']
          }
        }
      })
      
      const settingsMap = new Map(settings.map(s => [s.key, s.value]))
      
      return {
        enabled: settingsMap.get('broadcast_enabled') === 'true',
        baseUrl: settingsMap.get('broadcast_base_url') || 'https://classical.schachklub-k4.ch',
        tournamentTemplate: settingsMap.get('broadcast_tournament_template') || 'Classical League Season {season}',
        roundTemplate: settingsMap.get('broadcast_round_template') || 'Round {round}'
      }
    } catch {
      console.error('Failed to get broadcast settings')
      return {
        enabled: false,
        baseUrl: 'https://classical.schachklub-k4.ch',
        tournamentTemplate: 'Classical League Season {season}',
        roundTemplate: 'Round {round}'
      }
    }
  }
}