/**
 * Aggregate Totals Calculator
 *
 * Sums up all statistics across all rounds
 */

/**
 * Calculate aggregate totals across all rounds
 * @param {Array<Object>} rounds - Array of round data
 * @returns {Object} Aggregate statistics
 */
function aggregateTotals(rounds) {
  let totalGames = 0
  let totalMoves = 0
  let totalBlunders = 0
  let totalMistakes = 0
  let totalChecks = 0
  let totalEnPassant = 0
  let totalPromotions = 0
  let totalCastling = 0

  const piecesCaptured = {
    pawns: 0,
    knights: 0,
    bishops: 0,
    rooks: 0,
    queens: 0,
    total: 0
  }

  rounds.forEach(round => {
    // Basic stats
    totalGames += round.overview?.totalGames || 0
    totalMoves += round.overview?.totalMoves || 0

    // Stockfish analysis
    if (round.analysis?.games) {
      round.analysis.games.forEach(game => {
        totalBlunders += (game.whiteMoveQuality?.blunders || 0) + (game.blackMoveQuality?.blunders || 0)
        totalMistakes += (game.whiteMoveQuality?.mistakes || 0) + (game.blackMoveQuality?.mistakes || 0)
      })
    }

    // Tactical patterns
    if (round.tacticalPatterns) {
      totalChecks += round.tacticalPatterns.checks?.total || 0
    }

    // Tactics
    if (round.tactics) {
      // En passant
      if (round.tactics.enPassantGames) {
        totalEnPassant += round.tactics.enPassantGames.reduce((sum, g) => sum + g.count, 0)
      }

      // Promotions
      if (round.tactics.promotions) {
        totalPromotions += round.tactics.promotions.total || 0
      }

      // Castling
      if (round.tactics.castling) {
        totalCastling += (round.tactics.castling.kingsideCastling || 0) + (round.tactics.castling.queensideCastling || 0)
      }
    }

    // Piece captures (from pieces section, not tactics)
    if (round.pieces?.captured) {
      piecesCaptured.pawns += round.pieces.captured.pawns || 0
      piecesCaptured.knights += round.pieces.captured.knights || 0
      piecesCaptured.bishops += round.pieces.captured.bishops || 0
      piecesCaptured.rooks += round.pieces.captured.rooks || 0
      piecesCaptured.queens += round.pieces.captured.queens || 0
      piecesCaptured.total += (round.pieces.captured.pawns || 0) +
                             (round.pieces.captured.knights || 0) +
                             (round.pieces.captured.bishops || 0) +
                             (round.pieces.captured.rooks || 0) +
                             (round.pieces.captured.queens || 0)
    }
  })

  // Calculate averages
  const averageGameLength = totalGames > 0 ? totalMoves / totalGames : 0

  return {
    totalGames,
    totalMoves,
    averageGameLength: Math.round(averageGameLength * 10) / 10,
    totalBlunders,
    totalMistakes,
    piecesCaptured,
    totalChecks,
    totalEnPassant,
    totalPromotions,
    totalCastling
  }
}

module.exports = {
  aggregateTotals
}
