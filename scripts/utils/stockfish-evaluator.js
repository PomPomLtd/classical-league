/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Stockfish Evaluator Utility
 *
 * Provides chess position evaluation using Stockfish engine (nmrugg/stockfish.js)
 * Used for calculating accuracy, blunders, and ACPL metrics
 *
 * @module stockfish-evaluator
 */

const Stockfish = require('stockfish');

class StockfishEvaluator {
  constructor(depth = 15) {
    this.depth = depth;
    this.isReady = false;
    this.engine = null;

    this.initEngine();
  }

  /**
   * Initialize the Stockfish engine
   */
  async initEngine() {
    return new Promise((resolve) => {
      // stockfish package returns the engine directly
      this.engine = Stockfish();

      this.engine.onmessage = (line) => {
        this.handleMessage(line);
      };

      // Wait for engine to be ready
      const checkReady = setInterval(() => {
        if (this.isReady) {
          clearInterval(checkReady);
          resolve();
        }
      }, 50);

      // Start UCI protocol
      this.engine.postMessage('uci');
    });
  }

  /**
   * Handle messages from the engine
   */
  handleMessage(line) {
    // Engine ready
    if (line === 'uciok') {
      this.isReady = true;
    }
  }

  /**
   * Wait for engine to be ready
   */
  async waitForReady() {
    let attempts = 0;
    while (!this.isReady && attempts < 200) {
      await new Promise(resolve => setTimeout(resolve, 50));
      attempts++;
    }
    if (!this.isReady) {
      throw new Error('Stockfish failed to initialize after 10 seconds');
    }
  }

  /**
   * Evaluate a chess position
   *
   * @param {string} fen - FEN notation of position
   * @returns {Promise<Object>} Evaluation result { score, mate, bestMove }
   */
  async evaluatePosition(fen) {
    await this.waitForReady();

    return new Promise((resolve) => {
      this.currentEval = null;
      this.currentBestMove = null;
      let lastInfoScore = null;

      this.engine.onmessage = (line) => {
        // Parse evaluation from info lines
        if (line.startsWith('info') && line.includes('score')) {
          const cpMatch = line.match(/score cp (-?\d+)/);
          const mateMatch = line.match(/score mate (-?\d+)/);

          if (cpMatch) {
            lastInfoScore = {
              score: parseInt(cpMatch[1]),
              mate: null
            };
          } else if (mateMatch) {
            lastInfoScore = {
              score: null,
              mate: parseInt(mateMatch[1])
            };
          }

          // Extract best move if available
          const moveMatch = line.match(/pv (\w+)/);
          if (moveMatch) {
            this.currentBestMove = moveMatch[1];
          }
        }

        // Analysis complete
        if (line.startsWith('bestmove')) {
          const bestMoveMatch = line.match(/bestmove (\w+)/);
          if (bestMoveMatch && !this.currentBestMove) {
            this.currentBestMove = bestMoveMatch[1];
          }

          resolve({
            score: lastInfoScore?.score || 0,
            mate: lastInfoScore?.mate || null,
            bestMove: this.currentBestMove
          });
        }
      };

      // Set position and analyze
      this.engine.postMessage(`position fen ${fen}`);
      this.engine.postMessage(`go depth ${this.depth}`);
    });
  }

  /**
   * Evaluate multiple positions (optimized for batch processing)
   *
   * @param {Array<string>} fens - Array of FEN positions
   * @param {Function} progressCallback - Optional callback for progress updates
   * @returns {Promise<Array<Object>>} Array of evaluation results
   */
  async evaluatePositions(fens, progressCallback = null) {
    const results = [];

    for (let i = 0; i < fens.length; i++) {
      const result = await this.evaluatePosition(fens[i]);
      results.push(result);

      if (progressCallback) {
        progressCallback(i + 1, fens.length);
      }
    }

    return results;
  }

  /**
   * Quit the engine
   */
  quit() {
    this.engine.postMessage('quit');
  }
}

/**
 * Calculate centipawn loss from two evaluations
 *
 * @param {Object} prevEval - Previous position evaluation
 * @param {Object} currentEval - Current position evaluation
 * @param {string} side - 'w' or 'b' for which side to calculate from
 * @returns {number} Centipawn loss (positive number)
 */
function calculateCentipawnLoss(prevEval, currentEval, side) {
  // Handle checkmate evaluations
  if (prevEval.mate !== null) {
    prevEval.score = prevEval.mate > 0 ? 10000 : -10000;
  }
  if (currentEval.mate !== null) {
    currentEval.score = currentEval.mate > 0 ? 10000 : -10000;
  }

  // Flip score for black
  const prevScore = side === 'w' ? prevEval.score : -prevEval.score;
  const currentScore = side === 'w' ? currentEval.score : -currentEval.score;

  // Centipawn loss is decrease in evaluation
  const loss = Math.max(0, prevScore - currentScore);

  return loss;
}

/**
 * Classify move quality based on centipawn loss
 *
 * @param {number} cpLoss - Centipawn loss
 * @returns {string} Classification: 'book' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder'
 */
function classifyMoveQuality(cpLoss) {
  if (cpLoss === 0) return 'excellent';
  if (cpLoss < 20) return 'good';
  if (cpLoss < 50) return 'inaccuracy';
  if (cpLoss < 100) return 'mistake';
  return 'blunder';
}

/**
 * Calculate accuracy percentage from ACPL
 * Formula: 100 - (ACPL / 10), capped at 0-100
 *
 * @param {number} acpl - Average centipawn loss
 * @returns {number} Accuracy percentage (0-100)
 */
function calculateAccuracy(acpl) {
  return Math.max(0, Math.min(100, 100 - (acpl / 10)));
}

module.exports = {
  StockfishEvaluator,
  calculateCentipawnLoss,
  classifyMoveQuality,
  calculateAccuracy
};
