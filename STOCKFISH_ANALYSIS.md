# Stockfish Analysis - Implementation Plan

## Overview

This document outlines the plan and foundation for integrating Stockfish chess engine analysis into the statistics system.

## Goals

- Calculate accuracy percentage for each player
- Identify blunders, mistakes, and inaccuracies
- Calculate ACPL (Average Centipawn Loss)
- Add "Accuracy King" and "Biggest Blunder" awards

## Python-Based Implementation (Recommended)

### Why Python?

- **Simpler**: Python has mature chess libraries (`python-chess`, `stockfish`)
- **Reliable**: Well-tested packages with good documentation
- **Flexible**: Easy to run locally, integrate with Node.js via subprocess
- **Fast enough**: Depth 15 analysis ~1s per position

### Setup

1. **Install Stockfish Engine**
   ```bash
   # macOS
   brew install stockfish

   # Ubuntu/Debian
   sudo apt-get install stockfish

   # Verify installation
   which stockfish
   # Should output: /usr/local/bin/stockfish (or similar)
   ```

2. **Install Python Dependencies**
   ```bash
   pip install python-chess stockfish
   ```

3. **Test the Analyzer**
   ```bash
   # Analyze a PGN file
   curl -s "https://classical.schachklub-k4.ch/api/broadcast/round/{roundId}/pgn" | \
     python scripts/analyze-pgn.py > analysis.json

   # Or with custom depth and sampling
   python scripts/analyze-pgn.py --depth 15 --sample 2 < round1.pgn > analysis.json
   ```

### Usage

**Command Line:**
```bash
python scripts/analyze-pgn.py [OPTIONS] < input.pgn > output.json

Options:
  --depth N         Stockfish search depth (default: 15)
  --sample N        Analyze every Nth move (default: 2, for speed)
  --stockfish-path  Path to Stockfish binary
```

**Integration with Stats Generator:**
```javascript
// In generate-stats.js
const { execSync } = require('child_process');

if (process.argv.includes('--analyze')) {
  // Run Python analyzer
  const analysis = execSync(
    `python scripts/analyze-pgn.py --depth 15 --sample 2`,
    { input: pgnData, encoding: 'utf-8' }
  );

  const analysisData = JSON.parse(analysis);
  stats.analysis = analysisData.summary;
  // Merge per-game analysis into stats
}
```

### Output Format

```json
{
  "games": [
    {
      "gameIndex": 0,
      "white": "Player A",
      "black": "Player B",
      "whiteACPL": 25.3,
      "blackACPL": 45.1,
      "whiteAccuracy": 85.3,
      "blackAccuracy": 74.2,
      "whiteMoveQuality": {
        "blunders": 1,
        "mistakes": 3,
        "inaccuracies": 5,
        "good": 15,
        "excellent": 8
      },
      "blackMoveQuality": {
        "blunders": 2,
        "mistakes": 4,
        "inaccuracies": 6,
        "good": 12,
        "excellent": 5
      },
      "biggestBlunder": {
        "moveNumber": 18,
        "player": "black",
        "cpLoss": 450,
        "move": "Qh5??",
        "evalBefore": 120,
        "evalAfter": -330
      }
    }
  ],
  "summary": {
    "accuracyKing": {
      "player": "white",
      "accuracy": 95.2,
      "acpl": 15,
      "white": "Player A",
      "black": "Player B",
      "gameIndex": 3
    },
    "biggestBlunder": {
      "moveNumber": 18,
      "player": "black",
      "cpLoss": 450,
      "move": "Qh5??",
      "white": "Player C",
      "black": "Player D",
      "gameIndex": 5
    }
  }
}
```

## Performance Estimates

**For 20 games @ 40 moves each:**

- **Depth 12**: ~0.3s per position → ~2 minutes total (sample every 3 moves)
- **Depth 15**: ~1s per position → ~7 minutes total (sample every 2 moves)
- **Depth 18**: ~3s per position → ~20 minutes total (sample every 2 moves)

**Recommended**: Depth 15, sample every 2 moves = **~7 minutes per round**

## Move Quality Classification

Based on centipawn loss:
- **Excellent**: 0 cp loss (engine move)
- **Good**: 1-19 cp loss
- **Inaccuracy**: 20-49 cp loss
- **Mistake**: 50-99 cp loss
- **Blunder**: 100+ cp loss

## Accuracy Calculation

Formula: `Accuracy = 100 - (ACPL / 10)`
- ACPL 0 → 100% accuracy
- ACPL 100 → 90% accuracy
- ACPL 500 → 50% accuracy

## Fun Stats Awards

1. **👑 Accuracy King**
   - Highest accuracy across all games
   - Display: "95.2% accuracy (ACPL: 15)"

2. **💥 Biggest Blunder**
   - Highest centipawn loss in a single move
   - Display: "Move 18: Qh5?? (-450cp)"

3. **Future Ideas:**
   - 🎯 Most accurate game (both players)
   - 🤦 Most blunders in a single game
   - 📊 Highest combined ACPL (bloodbath)
   - ✨ Perfect accuracy (100%)

## Integration Steps

### Phase 1: Foundation (Completed)
- ✅ PGN parser stores FEN positions
- ✅ Python analyzer script created
- ✅ Documentation written

### Phase 2: Integration (Next)
- [ ] Add `--analyze` flag to generate-stats.js
- [ ] Call Python script via child_process
- [ ] Merge analysis data into stats JSON
- [ ] Update TypeScript interfaces

### Phase 3: UI (Future)
- [ ] Create analysis-stats component
- [ ] Display accuracy and ACPL
- [ ] Show Accuracy King award
- [ ] Show Biggest Blunder with move details

## Alternative: JavaScript Implementation

If Python setup is problematic, we can use:
- `stockfish` npm package (nmrugg) - Stockfish 17.1 in WASM
- More complex setup, but no external dependencies
- See `/scripts/utils/stockfish-evaluator.js` for foundation

## Important Notes

### Integration with Stats Generator (Recommended)

The best approach is to use our existing PGN parser which normalizes the PGN using `chess.pgn()`:

```javascript
// In generate-stats.js
const { parseMultipleGames } = require('./utils/pgn-parser');

// Parse and normalize PGN
const parsedGames = parseMultipleGames(pgnData);

// Extract normalized PGN for each game (uses chess.pgn() internally)
const normalizedPgn = parsedGames.valid.map(g => g.pgn).join('\n\n');

// Pass to Python analyzer if --analyze flag present
if (process.argv.includes('--analyze')) {
  const analysis = execSync(
    `venv/bin/python scripts/analyze-pgn.py --depth 15 --sample 2`,
    { input: normalizedPgn, encoding: 'utf-8' }
  );

  const analysisData = JSON.parse(analysis);
  // Merge with stats
  stats.analysis = analysisData.summary;
}
```

**Why this works:**
- Our PGN parser uses `chess.pgn()` to generate properly formatted PGN
- Includes required blank line between headers and moves
- 100% success rate (20/20 games parsed and analyzed)
- Python-chess accepts the normalized output without errors

### Other Notes

- Analysis is **optional** - stats can be generated without it
- Analysis is **local only** - never run in production/serverless
- Stockfish binary must be installed separately
- Python dependencies: `pip install python-chess stockfish`
- Analysis takes ~7 minutes for 20 games at depth 15
- **Tested**: Successfully analyzed all 20 Round 1 games with depth 12, sample 3

## Resources

- [python-chess documentation](https://python-chess.readthedocs.io/)
- [Stockfish Python wrapper](https://pypi.org/project/stockfish/)
- [Stockfish engine](https://stockfishchess.org/)
- [UCI Protocol](http://wbec-ridderkerk.nl/html/UCIProtocol.html)
