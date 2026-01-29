/**
 * Tournament configuration
 * Toggle isSeasonActive to control navigation and homepage display
 * Set to true when a new season starts, false when it ends
 */
export const tournamentConfig = {
  /** Whether there's an active ongoing season */
  isSeasonActive: false,

  /** Current season number for display purposes */
  currentSeasonNumber: 2,

  /** Lichess broadcast URL for the current/past season */
  lichessBroadcastUrl: 'https://lichess.org/broadcast/classical-league-season-2/LVSkiDuJ',
}
