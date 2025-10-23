 
/**
 * Leaderboards Generator
 *
 * Generates top-N leaderboards from player statistics
 */

/**
 * Generate all leaderboards from player stats
 * @param {Object} playerStats - Player statistics object
 * @returns {Object} Leaderboards
 */
function generateLeaderboards(playerStats) {
  const players = Object.values(playerStats)

  // Filter players with minimum games played (at least 3 games for meaningful stats)
  const activePlayers = players.filter(p => p.gamesPlayed >= 3)

  // Most Awards
  const mostAwards = players
    .filter(p => p.awardCount > 0)
    .map(p => ({
      player: p.normalizedName,
      displayName: p.displayName,
      count: p.awardCount,
      awards: p.awards
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Best Average ACPL (lower is better)
  const bestAverageACPL = activePlayers
    .filter(p => p.averageACPL !== null)
    .map(p => ({
      player: p.normalizedName,
      displayName: p.displayName,
      acpl: p.averageACPL,
      gamesPlayed: p.gamesPlayed
    }))
    .sort((a, b) => a.acpl - b.acpl)
    .slice(0, 10)

  // Worst Average ACPL (higher is worse)
  const worstAverageACPL = activePlayers
    .filter(p => p.averageACPL !== null)
    .map(p => ({
      player: p.normalizedName,
      displayName: p.displayName,
      acpl: p.averageACPL,
      gamesPlayed: p.gamesPlayed
    }))
    .sort((a, b) => b.acpl - a.acpl)
    .slice(0, 10)

  // Most Improved (biggest ACPL drop from early rounds to late rounds)
  const mostImproved = activePlayers
    .filter(p => {
      // Need at least one game in first 3 rounds and one in last 3 rounds
      const early = p.acplByRound.slice(0, 3).filter(v => v !== null)
      const late = p.acplByRound.slice(-3).filter(v => v !== null)
      return early.length > 0 && late.length > 0
    })
    .map(p => {
      const early = p.acplByRound.slice(0, 3).filter(v => v !== null)
      const late = p.acplByRound.slice(-3).filter(v => v !== null)
      const earlyAvg = early.reduce((sum, v) => sum + v, 0) / early.length
      const lateAvg = late.reduce((sum, v) => sum + v, 0) / late.length
      const improvement = earlyAvg - lateAvg // Positive = improved (lower ACPL)
      return {
        player: p.normalizedName,
        displayName: p.displayName,
        earlyACPL: Math.round(earlyAvg * 10) / 10,
        lateACPL: Math.round(lateAvg * 10) / 10,
        improvement: Math.round(improvement * 10) / 10
      }
    })
    .filter(p => p.improvement > 0) // Only show improvements
    .sort((a, b) => b.improvement - a.improvement)
    .slice(0, 10)

  // Most Games (attendance award)
  const mostGames = players
    .map(p => ({
      player: p.normalizedName,
      displayName: p.displayName,
      games: p.gamesPlayed
    }))
    .sort((a, b) => b.games - a.games)
    .slice(0, 10)

  // Most Versatile (most different openings used)
  const mostVersatile = activePlayers
    .filter(p => p.openingDiversity > 0)
    .map(p => ({
      player: p.normalizedName,
      displayName: p.displayName,
      openingsUsed: p.openingDiversity,
      openings: p.openingsUsed
    }))
    .sort((a, b) => b.openingsUsed - a.openingsUsed)
    .slice(0, 10)

  // Most Consistent (lowest ACPL variance)
  const mostConsistent = activePlayers
    .filter(p => p.acplVariance !== null && p.gamesPlayed >= 5)
    .map(p => ({
      player: p.normalizedName,
      displayName: p.displayName,
      averageACPL: p.averageACPL,
      variance: p.acplVariance,
      gamesPlayed: p.gamesPlayed
    }))
    .sort((a, b) => a.variance - b.variance)
    .slice(0, 10)

  // Highest Win Rate
  const highestWinRate = activePlayers
    .filter(p => p.gamesPlayed >= 5)
    .map(p => ({
      player: p.normalizedName,
      displayName: p.displayName,
      winRate: p.winRate,
      wins: p.wins,
      gamesPlayed: p.gamesPlayed
    }))
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 10)

  // Most Blunders (hall of shame)
  const mostBlunders = activePlayers
    .filter(p => p.totalBlunders > 0)
    .map(p => ({
      player: p.normalizedName,
      displayName: p.displayName,
      blunders: p.totalBlunders,
      blundersPerGame: Math.round((p.totalBlunders / p.gamesPlayed) * 10) / 10
    }))
    .sort((a, b) => b.blunders - a.blunders)
    .slice(0, 10)

  // Fewest Blunders (clean play award)
  const fewestBlunders = activePlayers
    .filter(p => p.totalBlunders >= 0)
    .map(p => ({
      player: p.normalizedName,
      displayName: p.displayName,
      blunders: p.totalBlunders,
      blundersPerGame: Math.round((p.totalBlunders / p.gamesPlayed) * 10) / 10
    }))
    .sort((a, b) => a.blundersPerGame - b.blundersPerGame)
    .slice(0, 10)

  return {
    mostAwards,
    bestAverageACPL,
    worstAverageACPL,
    mostImproved,
    mostGames,
    mostVersatile,
    mostConsistent,
    highestWinRate,
    mostBlunders,
    fewestBlunders
  }
}

module.exports = {
  generateLeaderboards
}
