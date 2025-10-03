/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Stockfish Evaluator
 * Quick test to verify Stockfish integration is working
 */

const { StockfishEvaluator } = require('./utils/stockfish-evaluator');

async function testStockfish() {
  console.log('🧪 Testing Stockfish evaluator...\n');

  const evaluator = new StockfishEvaluator(12); // Depth 12 for quick test

  // Test position: starting position
  const startPos = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  console.log('📍 Evaluating starting position...');
  const startEval = await evaluator.evaluatePosition(startPos);
  console.log(`   Score: ${startEval.score}cp, Best move: ${startEval.bestMove}`);
  console.log(`   Expected: ~0-30cp, bestMove: e2e4 or d2d4`);

  // Test position after 1.e4
  const afterE4 = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
  console.log('\n📍 Evaluating position after 1.e4...');
  const e4Eval = await evaluator.evaluatePosition(afterE4);
  console.log(`   Score: ${e4Eval.score}cp, Best move: ${e4Eval.bestMove}`);
  console.log(`   Expected: ~30-50cp, bestMove: e7e5 or c7c5`);

  // Test tactical position (white to move, Qh5 is mate in 1)
  const tacticPos = 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4';
  console.log('\n📍 Evaluating tactical position (mate in 1)...');
  const tacticEval = await evaluator.evaluatePosition(tacticPos);
  console.log(`   Score: ${tacticEval.mate ? `Mate in ${tacticEval.mate}` : `${tacticEval.score}cp`}`);
  console.log(`   Best move: ${tacticEval.bestMove}`);
  console.log(`   Expected: Mate in 1, bestMove: h5f7`);

  evaluator.quit();
  console.log('\n✅ Stockfish test complete!\n');
}

testStockfish().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
