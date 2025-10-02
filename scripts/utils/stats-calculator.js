/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Stats Calculator Utility
 *
 * Aggregates statistics from multiple parsed chess games.
 * Generates comprehensive stats matching the schema defined in STATS.md
 *
 * @module stats-calculator
 */

const { analyzeGamePhases, getPhaseStatistics } = require('./game-phases');

/**
 * Calculate comprehensive statistics from parsed games
 *
 * @param {Array} parsedGames - Array of parsed game objects from pgn-parser
 * @param {number} roundNumber - Round number
 * @param {number} seasonNumber - Season number
 * @returns {Object} Complete statistics object
 */
function calculateStats(parsedGames, roundNumber, seasonNumber) {
  const stats = {
    roundNumber,
    seasonNumber,
    generatedAt: new Date().toISOString(),
    overview: calculateOverview(parsedGames),
    gamePhases: calculateGamePhases(parsedGames),
    results: calculateResults(parsedGames),
    openings: calculateOpenings(parsedGames),
    tactics: calculateTactics(parsedGames),
    pieces: calculatePieceStats(parsedGames),
    checkmates: calculateCheckmates(parsedGames),
    boardHeatmap: calculateBoardHeatmap(parsedGames),
    awards: calculateAwards(parsedGames)
  };

  return stats;
}

/**
 * Calculate overview statistics
 * Note: chess.js history.length gives us half-moves (plies), so we divide by 2 for full moves
 */
function calculateOverview(games) {
  const totalMoves = games.reduce((sum, g) => sum + g.moves, 0);

  const longestGame = games.reduce((longest, game, idx) => {
    return game.moves > longest.moves ? { moves: game.moves, gameIndex: idx, game } : longest;
  }, { moves: 0, gameIndex: 0, game: null });

  const shortestGame = games.reduce((shortest, game, idx) => {
    return game.moves < shortest.moves ? { moves: game.moves, gameIndex: idx, game } : shortest;
  }, { moves: Infinity, gameIndex: 0, game: null });

  return {
    totalGames: games.length,
    totalMoves,
    averageGameLength: totalMoves / games.length / 2, // Divide by 2 for full moves
    longestGame: {
      moves: Math.ceil(longestGame.moves / 2), // Divide by 2 for full moves
      white: longestGame.game.headers.White || 'Unknown',
      black: longestGame.game.headers.Black || 'Unknown',
      result: longestGame.game.result
    },
    shortestGame: {
      moves: Math.ceil(shortestGame.moves / 2), // Divide by 2 for full moves
      white: shortestGame.game.headers.White || 'Unknown',
      black: shortestGame.game.headers.Black || 'Unknown',
      result: shortestGame.game.result
    }
  };
}

/**
 * Calculate game phase statistics
 * Note: Phase lengths are in half-moves, so we divide by 2 for full moves
 */
function calculateGamePhases(games) {
  const allPhases = games.map(g => analyzeGamePhases(g.moveList, g.pgn));
  const phaseStats = getPhaseStatistics(allPhases);

  return {
    averageOpening: phaseStats.averageOpening / 2,
    averageMiddlegame: phaseStats.averageMiddlegame / 2,
    averageEndgame: phaseStats.averageEndgame / 2,
    longestOpening: {
      moves: Math.ceil(phaseStats.longestOpening.moves / 2),
      white: games[phaseStats.longestOpening.gameIndex].headers.White || 'Unknown',
      black: games[phaseStats.longestOpening.gameIndex].headers.Black || 'Unknown',
      game: `${games[phaseStats.longestOpening.gameIndex].headers.White} vs ${games[phaseStats.longestOpening.gameIndex].headers.Black}`
    },
    longestMiddlegame: {
      moves: Math.ceil(phaseStats.longestMiddlegame.moves / 2),
      white: games[phaseStats.longestMiddlegame.gameIndex].headers.White || 'Unknown',
      black: games[phaseStats.longestMiddlegame.gameIndex].headers.Black || 'Unknown',
      game: `${games[phaseStats.longestMiddlegame.gameIndex].headers.White} vs ${games[phaseStats.longestMiddlegame.gameIndex].headers.Black}`
    },
    longestEndgame: {
      moves: Math.ceil(phaseStats.longestEndgame.moves / 2),
      white: games[phaseStats.longestEndgame.gameIndex].headers.White || 'Unknown',
      black: games[phaseStats.longestEndgame.gameIndex].headers.Black || 'Unknown',
      game: `${games[phaseStats.longestEndgame.gameIndex].headers.White} vs ${games[phaseStats.longestEndgame.gameIndex].headers.Black}`
    }
  };
}

/**
 * Calculate win/loss/draw statistics
 */
function calculateResults(games) {
  let whiteWins = 0;
  let blackWins = 0;
  let draws = 0;

  games.forEach(game => {
    const result = game.result;
    if (result === '1-0') whiteWins++;
    else if (result === '0-1') blackWins++;
    else if (result === '1/2-1/2') draws++;
  });

  const total = games.length;

  return {
    whiteWins,
    blackWins,
    draws,
    whiteWinPercentage: (whiteWins / total) * 100,
    blackWinPercentage: (blackWins / total) * 100,
    drawPercentage: (draws / total) * 100
  };
}

/**
 * Calculate opening statistics
 */
function calculateOpenings(games) {
  const firstMoves = {};
  const openingSequences = {};

  games.forEach(game => {
    if (game.moveList.length > 0) {
      // First move
      const firstMove = game.moveList[0].san;
      if (!firstMoves[firstMove]) {
        firstMoves[firstMove] = { count: 0, wins: 0, draws: 0, losses: 0 };
      }
      firstMoves[firstMove].count++;

      // Track results for this opening
      if (game.result === '1-0') firstMoves[firstMove].wins++;
      else if (game.result === '1/2-1/2') firstMoves[firstMove].draws++;
      else if (game.result === '0-1') firstMoves[firstMove].losses++;

      // Opening sequence (first 6 moves = 3 moves each side)
      if (game.moveList.length >= 6) {
        const sequence = game.moveList.slice(0, 6).map(m => m.san).join(' ');
        openingSequences[sequence] = (openingSequences[sequence] || 0) + 1;
      }
    }
  });

  // Format first moves with percentages and win rates
  const formattedFirstMoves = {};
  const total = games.length;
  Object.entries(firstMoves).forEach(([move, data]) => {
    formattedFirstMoves[move] = {
      count: data.count,
      percentage: (data.count / total) * 100,
      winRate: data.count > 0 ? (data.wins / data.count) * 100 : 0
    };
  });

  // Get popular sequences
  const popularSequences = Object.entries(openingSequences)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([moves, count]) => ({ moves, count }));

  return {
    firstMoves: formattedFirstMoves,
    popularSequences
  };
}

/**
 * Calculate tactical statistics
 */
function calculateTactics(games) {
  let totalCaptures = 0;
  let totalPromotions = 0;
  let totalCastlingKingside = 0;
  let totalCastlingQueenside = 0;

  const enPassantGames = [];
  let bloodiestGame = { captures: 0, gameIndex: 0 };
  let quietestGame = { captures: Infinity, gameIndex: 0 };
  let longestNonCaptureStreak = { moves: 0, gameIndex: 0 };

  games.forEach((game, idx) => {
    const sm = game.specialMoves;
    totalCaptures += sm.totalCaptures;
    totalPromotions += sm.totalPromotions;
    totalCastlingKingside += sm.totalCastlingKingside;
    totalCastlingQueenside += sm.totalCastlingQueenside;

    if (sm.totalEnPassant > 0) {
      enPassantGames.push({
        white: game.headers.White || 'Unknown',
        black: game.headers.Black || 'Unknown',
        count: sm.totalEnPassant
      });
    }

    if (sm.totalCaptures > bloodiestGame.captures) {
      bloodiestGame = {
        captures: sm.totalCaptures,
        gameIndex: idx,
        white: game.headers.White || 'Unknown',
        black: game.headers.Black || 'Unknown'
      };
    }

    if (sm.totalCaptures < quietestGame.captures) {
      quietestGame = {
        captures: sm.totalCaptures,
        gameIndex: idx,
        white: game.headers.White || 'Unknown',
        black: game.headers.Black || 'Unknown'
      };
    }

    // Find longest non-capture streak
    let currentStreak = 0;
    let maxStreak = 0;
    game.moveList.forEach(move => {
      if (move.captured) {
        currentStreak = 0;
      } else {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      }
    });

    if (maxStreak > longestNonCaptureStreak.moves) {
      longestNonCaptureStreak = {
        moves: maxStreak,
        gameIndex: idx,
        white: game.headers.White || 'Unknown',
        black: game.headers.Black || 'Unknown'
      };
    }
  });

  return {
    totalCaptures,
    enPassantGames,
    promotions: totalPromotions,
    castling: {
      kingside: totalCastlingKingside,
      queenside: totalCastlingQueenside
    },
    bloodiestGame,
    quietestGame,
    longestNonCaptureStreak
  };
}

/**
 * Calculate piece statistics
 */
function calculatePieceStats(games) {
  const activity = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
  const captured = { p: 0, n: 0, b: 0, r: 0, q: 0 };
  const survival = { rooks: [], queens: [], bishops: [], knights: [] };

  games.forEach(game => {
    // Activity
    game.moveList.forEach(move => {
      activity[move.piece]++;
      if (move.captured) {
        captured[move.captured]++;
      }
    });

    // Survival
    const pc = game.piecesRemaining;
    survival.rooks.push(pc.w_r + pc.b_r);
    survival.queens.push(pc.w_q + pc.b_q);
    survival.bishops.push(pc.w_b + pc.b_b);
    survival.knights.push(pc.w_n + pc.b_n);
  });

  const pieceNames = { p: 'pawns', n: 'knights', b: 'bishops', r: 'rooks', q: 'queens', k: 'kings' };
  const formattedActivity = {};
  Object.entries(activity).forEach(([piece, count]) => {
    formattedActivity[pieceNames[piece]] = count;
  });

  const formattedCaptured = {};
  Object.entries(captured).forEach(([piece, count]) => {
    formattedCaptured[pieceNames[piece]] = count;
  });

  return {
    activity: formattedActivity,
    captured: formattedCaptured,
    survivalRate: {
      rooks: survival.rooks.reduce((a, b) => a + b, 0) / survival.rooks.length / 4,
      queens: survival.queens.reduce((a, b) => a + b, 0) / survival.queens.length / 2,
      bishops: survival.bishops.reduce((a, b) => a + b, 0) / survival.bishops.length / 4,
      knights: survival.knights.reduce((a, b) => a + b, 0) / survival.knights.length / 4
    }
  };
}

/**
 * Calculate checkmate statistics
 */
function calculateCheckmates(games) {
  const byPiece = { queen: 0, rook: 0, bishop: 0, knight: 0, pawn: 0, king: 0, other: 0 };
  let fastestMate = { moves: Infinity, gameIndex: 0 };

  games.forEach((game, idx) => {
    game.specialMoves.checkmates.forEach(mate => {
      const piece = mate.piece;
      if (byPiece[piece] !== undefined) {
        byPiece[piece]++;
      } else {
        byPiece.other++;
      }

      if (mate.moveNumber < fastestMate.moves) {
        fastestMate = {
          moves: Math.ceil(mate.moveNumber / 2), // Divide by 2 for full moves
          gameIndex: idx,
          white: game.headers.White || 'Unknown',
          black: game.headers.Black || 'Unknown',
          winner: mate.color === 'w' ? 'White' : 'Black'
        };
      }
    });
  });

  return {
    byPiece,
    fastest: fastestMate.moves !== Infinity ? fastestMate : null
  };
}

/**
 * Calculate board heatmap statistics
 * Tracks square activity (moves to/from) and captures on each square
 */
function calculateBoardHeatmap(games) {
  const squareActivity = {}; // Total moves to/from each square
  const captureSquares = {}; // Captures on each square

  // Initialize all squares
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

  files.forEach(file => {
    ranks.forEach(rank => {
      const square = file + rank;
      squareActivity[square] = 0;
      captureSquares[square] = 0;
    });
  });

  // Track activity and captures
  games.forEach(game => {
    game.moveList.forEach(move => {
      // Track destination square activity
      if (move.to) {
        squareActivity[move.to] = (squareActivity[move.to] || 0) + 1;
      }

      // Track captures on squares
      if (move.captured && move.to) {
        captureSquares[move.to] = (captureSquares[move.to] || 0) + 1;
      }
    });
  });

  // Find most/least active squares
  const sortedActivity = Object.entries(squareActivity).sort((a, b) => b[1] - a[1]);
  const sortedCaptures = Object.entries(captureSquares).sort((a, b) => b[1] - a[1]);

  // Get non-zero squares for least popular
  const activeSquares = sortedActivity.filter(([sq, count]) => count > 0);

  return {
    bloodiestSquare: {
      square: sortedCaptures[0][0],
      captures: sortedCaptures[0][1],
      description: `${sortedCaptures[0][0]} saw ${sortedCaptures[0][1]} captures`
    },
    mostPopularSquare: {
      square: sortedActivity[0][0],
      visits: sortedActivity[0][1],
      description: `${sortedActivity[0][0]} was visited ${sortedActivity[0][1]} times`
    },
    leastPopularSquare: {
      square: activeSquares[activeSquares.length - 1][0],
      visits: activeSquares[activeSquares.length - 1][1],
      description: `${activeSquares[activeSquares.length - 1][0]} was only visited ${activeSquares[activeSquares.length - 1][1]} times`
    },
    quietestSquares: sortedActivity.filter(([, count]) => count === 0).map(([sq]) => sq),
    top5Bloodiest: sortedCaptures.slice(0, 5).map(([sq, count]) => ({ square: sq, captures: count })),
    top5Popular: sortedActivity.slice(0, 5).map(([sq, count]) => ({ square: sq, visits: count }))
  };
}

/**
 * Calculate awards (fun stats)
 */
function calculateAwards(games) {
  const tactics = calculateTactics(games);
  const checkmates = calculateCheckmates(games);
  const phases = games.map(g => analyzeGamePhases(g.moveList, g.pgn));

  const longestEndgame = phases.reduce((longest, phase, idx) => {
    return phase.endgame > longest.moves ? { moves: phase.endgame, gameIndex: idx } : longest;
  }, { moves: 0, gameIndex: 0 });

  const shortestOpening = phases.reduce((shortest, phase, idx) => {
    if (phase.opening === 0) return shortest;
    return phase.opening < shortest.moves ? { moves: phase.opening, gameIndex: idx } : shortest;
  }, { moves: Infinity, gameIndex: 0 });

  return {
    bloodbath: {
      white: tactics.bloodiestGame.white,
      black: tactics.bloodiestGame.black,
      captures: tactics.bloodiestGame.captures
    },
    pacifist: {
      white: tactics.quietestGame.white,
      black: tactics.quietestGame.black,
      captures: tactics.quietestGame.captures
    },
    speedDemon: checkmates.fastest ? {
      white: checkmates.fastest.white,
      black: checkmates.fastest.black,
      moves: checkmates.fastest.moves,
      winner: checkmates.fastest.winner
    } : null,
    endgameWizard: {
      white: games[longestEndgame.gameIndex].headers.White || 'Unknown',
      black: games[longestEndgame.gameIndex].headers.Black || 'Unknown',
      endgameMoves: Math.ceil(longestEndgame.moves / 2) // Divide by 2 for full moves
    },
    openingSprinter: shortestOpening.moves !== Infinity ? {
      white: games[shortestOpening.gameIndex].headers.White || 'Unknown',
      black: games[shortestOpening.gameIndex].headers.Black || 'Unknown',
      openingMoves: Math.ceil(shortestOpening.moves / 2) // Divide by 2 for full moves
    } : null
  };
}

module.exports = {
  calculateStats,
  calculateOverview,
  calculateGamePhases,
  calculateResults,
  calculateOpenings,
  calculateTactics,
  calculatePieceStats,
  calculateCheckmates,
  calculateBoardHeatmap,
  calculateAwards
};
