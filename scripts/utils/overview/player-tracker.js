/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Player Tracker
 *
 * Tracks individual player statistics across all rounds
 */

const { normalizePlayerName, getDisplayName } = require('./player-normalizer')

/**
 * Get or create player entry
 * @param {Map} playerMap - Map of player data
 * @param {string} normalizedName - Normalized player name
 * @returns {Object} Player data object
 */
function getOrCreatePlayer(playerMap, normalizedName) {
  if (!playerMap.has(normalizedName)) {
    playerMap.set(normalizedName, {
      normalizedName,
      displayNames: [],
      gamesPlayed: 0,
      gamesAsWhite: 0,
      gamesAsBlack: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      awards: [],
      acplData: [],
      accuracyData: [],
      openingsUsed: new Set(),
      totalBlunders: 0,
      totalMistakes: 0
    })
  }
  return playerMap.get(normalizedName)
}

/**
 * Track a fun stat award for a player
 * @param {Map} playerMap - Map of player data
 * @param {number} roundNumber - Round number
 * @param {string} awardName - Name of the award
 * @param {Object} awardData - Award data object
 */
function trackAward(playerMap, roundNumber, awardName, awardData) {
  // Skip if no data
  if (!awardData) return

  // Determine which player(s) won the award
  const players = []

  // Awards that have a single player winner (with 'color' property)
  if (awardData.color && awardData.white && awardData.black) {
    const playerName = awardData.color === 'White' || awardData.color === 'white'
      ? awardData.white
      : awardData.black
    players.push({ name: playerName, data: awardData })
  }
  // Awards that have a winner property
  else if (awardData.winner && awardData.white && awardData.black) {
    const playerName = awardData.winner === 'white' || awardData.winner === 'White'
      ? awardData.white
      : awardData.black
    players.push({ name: playerName, data: awardData })
  }
  // Awards that have a playerName property
  else if (awardData.playerName) {
    players.push({ name: awardData.playerName, data: awardData })
  }
  // Awards for both players (like bloodbath)
  else if (awardData.white && awardData.black && !awardData.color && !awardData.winner) {
    players.push({ name: awardData.white, data: awardData })
    players.push({ name: awardData.black, data: awardData })
  }

  // Track each player
  players.forEach(({ name, data }) => {
    const normalized = normalizePlayerName(name)
    const player = getOrCreatePlayer(playerMap, normalized)

    // Add display name
    if (!player.displayNames.includes(name)) {
      player.displayNames.push(name)
    }

    // Format award details based on type
    let details = ''
    if (data.distance) details = `${data.distance} squares`
    else if (data.retreats) details = `${data.retreats} retreats`
    else if (data.moves !== undefined) details = `${data.moves} moves`
    else if (data.length) details = `${data.length} in a row`
    else if (data.count) details = `${data.count}`
    else if (data.squares) details = `${data.squares} squares`
    else if (data.captures) details = `${data.captures} captures`

    player.awards.push({
      round: roundNumber,
      award: formatAwardName(awardName),
      details
    })
  })
}

/**
 * Format award name to human-readable form
 * @param {string} awardName - Camel case award name
 * @returns {string} Formatted award name
 */
function formatAwardName(awardName) {
  // Map of special names
  const specialNames = {
    sportyQueen: 'Sporty Queen',
    chickenAward: 'Chicken Award',
    dadbodShuffler: 'Dadbod Shuffler',
    openingHipster: 'Opening Hipster',
    castlingRace: 'Castling Race Winner',
    squareTourist: 'Square Tourist',
    pieceLoyalty: 'Piece Loyalty',
    pawnStorm: 'Pawn Storm',
    longestCheckSequence: 'Longest King Hunt',
    longestCaptureSequence: 'Longest Capture Spree',
    fastestQueenTrade: 'Fastest Queen Trade',
    slowestQueenTrade: 'Slowest Queen Trade',
    edgeLord: 'Professional Edger',
    rookLift: 'Rook Lift',
    centerStage: 'Center Stage',
    darkLord: 'Dark Mode Enthusiast',
    homebody: 'Homeboy',
    lateBloomer: 'Late Bloomer',
    quickDraw: 'Fastest Gun',
    crosshairs: 'Crosshairs',
    longestTension: 'Hypertension Award'
  }

  return specialNames[awardName] || awardName
}

/**
 * Track game performance for a player
 * @param {Map} playerMap - Map of player data
 * @param {number} roundNumber - Round number
 * @param {Object} game - Game data from Stockfish analysis
 */
function trackGamePerformance(playerMap, roundNumber, game) {
  // Track white player
  const whiteNormalized = normalizePlayerName(game.white)
  const whitePlayer = getOrCreatePlayer(playerMap, whiteNormalized)
  if (!whitePlayer.displayNames.includes(game.white)) {
    whitePlayer.displayNames.push(game.white)
  }
  whitePlayer.gamesPlayed++
  whitePlayer.gamesAsWhite++

  if (game.whiteACPL !== undefined && game.whiteACPL !== null) {
    whitePlayer.acplData.push({ round: roundNumber, acpl: game.whiteACPL })
  }
  if (game.whiteAccuracy !== undefined && game.whiteAccuracy !== null) {
    whitePlayer.accuracyData.push({ round: roundNumber, accuracy: game.whiteAccuracy })
  }
  if (game.whiteMoveQuality) {
    whitePlayer.totalBlunders += game.whiteMoveQuality.blunders || 0
    whitePlayer.totalMistakes += game.whiteMoveQuality.mistakes || 0
  }

  // Track black player
  const blackNormalized = normalizePlayerName(game.black)
  const blackPlayer = getOrCreatePlayer(playerMap, blackNormalized)
  if (!blackPlayer.displayNames.includes(game.black)) {
    blackPlayer.displayNames.push(game.black)
  }
  blackPlayer.gamesPlayed++
  blackPlayer.gamesAsBlack++

  if (game.blackACPL !== undefined && game.blackACPL !== null) {
    blackPlayer.acplData.push({ round: roundNumber, acpl: game.blackACPL })
  }
  if (game.blackAccuracy !== undefined && game.blackAccuracy !== null) {
    blackPlayer.accuracyData.push({ round: roundNumber, accuracy: game.blackAccuracy })
  }
  if (game.blackMoveQuality) {
    blackPlayer.totalBlunders += game.blackMoveQuality.blunders || 0
    blackPlayer.totalMistakes += game.blackMoveQuality.mistakes || 0
  }
}

/**
 * Track opening usage for a player
 * NOTE: Currently unused - for future enhancement when we have per-game opening data
 * @param {Map} playerMap - Map of player data
 * @param {string} playerName - Full player name
 * @param {string} eco - ECO code
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function trackOpening(playerMap, playerName, eco) {
  if (!eco) return

  const normalized = normalizePlayerName(playerName)
  const player = getOrCreatePlayer(playerMap, normalized)

  if (!player.displayNames.includes(playerName)) {
    player.displayNames.push(playerName)
  }

  player.openingsUsed.add(eco)
}

/**
 * Calculate derived player statistics
 * @param {Object} player - Player data object
 * @returns {Object} Player stats with calculated values
 */
function calculateDerivedStats(player) {
  const winRate = player.gamesPlayed > 0
    ? (player.wins / player.gamesPlayed * 100).toFixed(1)
    : 0

  const averageACPL = player.acplData.length > 0
    ? player.acplData.reduce((sum, d) => sum + d.acpl, 0) / player.acplData.length
    : null

  const bestACPL = player.acplData.length > 0
    ? Math.min(...player.acplData.map(d => d.acpl))
    : null

  const worstACPL = player.acplData.length > 0
    ? Math.max(...player.acplData.map(d => d.acpl))
    : null

  // Calculate ACPL and accuracy by round (fill gaps with null)
  const acplByRound = Array(7).fill(null)
  const accuracyByRound = Array(7).fill(null)

  player.acplData.forEach(d => {
    acplByRound[d.round - 1] = Math.round(d.acpl * 10) / 10
  })

  player.accuracyData.forEach(d => {
    accuracyByRound[d.round - 1] = Math.round(d.accuracy * 10) / 10
  })

  // Calculate ACPL variance for consistency metric
  let acplVariance = null
  if (player.acplData.length >= 3) {
    const values = player.acplData.map(d => d.acpl)
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
    const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length
    acplVariance = Math.round(Math.sqrt(variance) * 10) / 10 // Standard deviation
  }

  // Get favorite opening (most used)
  let favoriteOpening = null
  if (player.openingsUsed.size > 0) {
    favoriteOpening = Array.from(player.openingsUsed)[0] // Just take first for now
  }

  return {
    normalizedName: player.normalizedName,
    displayName: getDisplayName(player.displayNames),
    gamesPlayed: player.gamesPlayed,
    gamesAsWhite: player.gamesAsWhite,
    gamesAsBlack: player.gamesAsBlack,
    wins: player.wins,
    losses: player.losses,
    draws: player.draws,
    winRate: parseFloat(winRate),
    awards: player.awards,
    awardCount: player.awards.length,
    averageACPL: averageACPL !== null ? Math.round(averageACPL * 10) / 10 : null,
    bestACPL: bestACPL !== null ? Math.round(bestACPL * 10) / 10 : null,
    worstACPL: worstACPL !== null ? Math.round(worstACPL * 10) / 10 : null,
    acplByRound,
    accuracyByRound,
    acplVariance,
    openingsUsed: Array.from(player.openingsUsed),
    openingDiversity: player.openingsUsed.size,
    favoriteOpening,
    totalBlunders: player.totalBlunders,
    totalMistakes: player.totalMistakes
  }
}

/**
 * Track all players across all rounds
 * @param {Array<Object>} rounds - Array of round data
 * @returns {Object} Player statistics keyed by normalized name
 */
function trackPlayers(rounds) {
  const playerMap = new Map()

  rounds.forEach(round => {
    const roundNum = round.roundNumber

    // Track fun stat awards
    if (round.funStats) {
      Object.entries(round.funStats).forEach(([awardName, awardData]) => {
        trackAward(playerMap, roundNum, awardName, awardData)
      })
    }

    // Track Stockfish awards
    if (round.analysis?.summary) {
      const summary = round.analysis.summary

      // Accuracy King
      if (summary.accuracyKing) {
        const playerName = summary.accuracyKing.player === 'white'
          ? summary.accuracyKing.white
          : summary.accuracyKing.black
        const normalized = normalizePlayerName(playerName)
        const player = getOrCreatePlayer(playerMap, normalized)
        if (!player.displayNames.includes(playerName)) {
          player.displayNames.push(playerName)
        }
        player.awards.push({
          round: roundNum,
          award: 'GM Energy',
          details: `${summary.accuracyKing.accuracy}% accuracy`
        })
      }

      // Blunder of the Round
      if (summary.biggestBlunder) {
        const playerName = summary.biggestBlunder.player === 'white'
          ? summary.biggestBlunder.white
          : summary.biggestBlunder.black
        const normalized = normalizePlayerName(playerName)
        const player = getOrCreatePlayer(playerMap, normalized)
        if (!player.displayNames.includes(playerName)) {
          player.displayNames.push(playerName)
        }
        player.awards.push({
          round: roundNum,
          award: 'Blunder of the Round',
          details: `${summary.biggestBlunder.cpLoss} cp loss`
        })
      }
    }

    // Track other awards (bloodbath, grind, crusher)
    if (round.awards) {
      if (round.awards.bloodbath) {
        trackAward(playerMap, roundNum, 'bloodbath', round.awards.bloodbath)
      }
      if (round.awards.grind) {
        trackAward(playerMap, roundNum, 'grind', round.awards.grind)
      }
      if (round.awards.crusher) {
        trackAward(playerMap, roundNum, 'crusher', round.awards.crusher)
      }
    }

    // Track game performances
    if (round.analysis?.games) {
      round.analysis.games.forEach(game => {
        trackGamePerformance(playerMap, roundNum, game)
      })
    }

    // Track opening usage
    if (round.openings?.popularSequences) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      round.openings.popularSequences.forEach(_seq => {
        // We don't have per-player opening data in the current structure
        // This would require parsing the games array which we don't have
        // Skip for now - we can add this later if needed
      })
    }
  })

  // Convert to object with calculated stats
  const playerStats = {}
  playerMap.forEach((player, normalizedName) => {
    playerStats[normalizedName] = calculateDerivedStats(player)
  })

  return playerStats
}

module.exports = {
  trackPlayers
}
