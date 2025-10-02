# Chess Tournament Statistics - Research & Implementation Guide

## Executive Summary

This document outlines the research findings and implementation strategy for creating a comprehensive statistics page for the K4 Classical League. Based on extensive testing with real tournament PGN data, we've identified feasible statistics categories and the technical approach to implement them.

## Research Findings

### 1. PGN Parsing Libraries

#### JavaScript/TypeScript (Recommended for Next.js)
- **chess.js** (v1.4.0) - ✅ **PRIMARY CHOICE**
  - Excellent PGN parsing with verbose move history
  - Provides detailed move information (captures, castling, en passant, checks, checkmates)
  - Board state analysis at any point in the game
  - Active maintenance (last updated June 2025)
  - Already installed and tested successfully
  - **Limitations**: Some PGN formatting issues with certain games (1 out of 17 failed to parse)

- **@mliebelt/pgn-parser**
  - Alternative parser with JSON output
  - Supports variations and comments
  - Good for complex PGN files

#### Python (Alternative)
- **python-chess**
  - More comprehensive analysis capabilities
  - Better error handling for malformed PGNs
  - Supports engine analysis (Stockfish integration)
  - **Use case**: Could be used for advanced analysis scripts that generate JSON for frontend

### 2. Opening Detection

**Available Options:**
- **chess-tools** (npm) - Has ECO opening classification
  - Last published 2017, may be outdated
  - Supports ECO codes, opening names, variations
  
- **Manual ECO Database** - Best approach
  - Use a JSON/database of ECO openings
  - Match first 8-12 moves against known openings
  - More reliable than old libraries

- **Simple Pattern Matching** - Easiest to implement
  - Track first 3-5 moves for popular openings
  - Create custom mapping for common openings (Sicilian, Italian, French, etc.)
  - Good enough for tournament-level stats

### 3. Position Evaluation (Advanced - Optional)

**Stockfish.js/WASM:**
- **stockfish** (npm) - Stockfish 17.1 available
- **Pros**: Accurate position evaluation, can calculate average centipawn loss (ACPL)
- **Cons**: 
  - Heavy (7MB-75MB depending on version)
  - Requires computation time (slow for many games)
  - May not work well in Vercel serverless environment
  - Better suited for local analysis scripts

**Recommendation**: Skip engine evaluation for MVP, consider for future enhancement

## Test Results from Round 1 Data

Successfully parsed **16 out of 17 games** from Round 1:

### Basic Statistics
- **Total moves**: 1,128 (avg 70.5 moves per game)
- **Results**: 56.3% White wins, 37.5% Black wins, 6.3% Draws
- **Longest game**: 139 moves
- **Shortest game**: 8 moves (likely forfeit/incomplete)
- **Fastest checkmate**: 76 moves

### Game Phase Statistics
- **Average opening length**: 17.7 moves (until castling/development)
- **Average middlegame length**: 20.4 moves (complex tactical phase)
- **Average endgame length**: 36.8 moves (reduced material)
- **Longest opening**: 20 moves
- **Longest middlegame**: 33 moves
- **Longest endgame**: 111 moves (that's a grind!)

### Move Statistics
- **Opening moves**: e4 (50%), d4 (37.5%), c4 (12.5%)
- **Castling**: 22 kingside, 3 queenside
- **En passant**: 0 occurrences (rare move confirmed!)
- **Promotions**: 1 pawn promotion
- **Total captures**: 274 pieces

### Piece Statistics
- **Most active pieces**: Pawns (297 moves), Knights (215), Rooks (208)
- **Most captured**: Pawns (134), Bishops (46), Knights (44), Rooks (32), Queens (18)
- **Average piece survival at endgame**:
  - Rooks: 2.0 out of 4
  - Queens: 0.9 out of 2
  - Bishops: 1.1 out of 4
  - Knights: 1.3 out of 4
- **Average pieces at game end**: 14.9

### Interesting Finds
- **Games with both queens captured**: 5
- **Longest sequence without capture**: 40 moves
- **Checkmate patterns**: Mostly by queens and rooks (need better detection)

## Feasible Statistics Categories

### 🏆 Overall Season Stats (All Rounds Combined)

#### Win/Loss/Draw Statistics
- ✅ Overall W/L/D percentages
- ✅ Win rate by color (White vs Black advantage)
- ✅ Most decisive player (highest win percentage)
- ✅ Drawing master (who draws the most)

#### Game Length & Pace
- ✅ Average game length (in moves)
- ✅ Longest game of the season
- ✅ Shortest decisive game
- ✅ Most efficient win (fewest moves)
- ✅ **Game Phase Analysis**:
  - Average opening length (until castling/development complete)
  - Average middlegame length (complex tactical phase)
  - Average endgame length (reduced material phase)
  - Longest opening/middlegame/endgame of the season

#### Opening Repertoire
- ✅ Most popular first move (e4, d4, c4, Nf3, etc.)
- ✅ Most popular opening sequences (first 4-6 moves)
- ✅ Opening success rates (which openings win most)
- 🔄 ECO opening names (if we implement ECO matching)

#### Tactical & Special Moves
- ✅ Total captures across all games
- ✅ Most bloodthirsty game (most captures)
- ✅ Quietest game (fewest captures)
- ✅ En passant counter (with game highlights!)
- ✅ Castling statistics (kingside vs queenside preference)
- ✅ Pawn promotion counter
- ✅ Longest sequence without captures (boring chess award 😄)

#### Piece Statistics
- ✅ Most active piece type (total moves)
- ✅ Most captured piece type
- ✅ Average piece survival rates
- ✅ Games ending with both queens captured
- ✅ Average material on board at endgame

#### Checkmate Patterns
- ✅ Checkmate by piece type (Queen, Rook, Bishop, Knight, Pawn)
- ✅ Fastest checkmate of the season
- ✅ Back rank mate counter (if we can detect pattern)

#### Blunder Detection (Advanced - Requires Stockfish)
- 🔄 **Biggest Blunders**: Largest evaluation swings after a single move
  - Requires: Stockfish.js evaluation of each position
  - Threshold: >200 centipawn swing = blunder, >400 = major blunder
  - Shows: Move number, player, evaluation before/after, move notation
- 🔄 **Blunder Frequency**: Average blunders per game
- 🔄 **Clean Games**: Games with fewest blunders
- 🔄 **Comeback King**: Biggest recovery after opponent blunder

### 📊 Individual Round Stats

Each round gets its own page with:
- All of the above stats, but scoped to that round
- Round-specific leaderboards
- Notable games from that round
- Visual PGN viewer for interesting games

### 🎭 Fun/Silly Stats Ideas

#### "Awards" System
- 🩸 **Bloodbath Award**: Most captures in a single game
- 🕊️ **Pacifist Award**: Fewest captures in a winning game
- ⚡ **Speed Demon**: Fastest checkmate
- 🐌 **Marathon Master**: Longest game
- 👑 **Queen Sacrifice**: Games with early queen captures
- 🏰 **Fortress Builder**: Most defensive games (fewest piece trades)
- 🎯 **Sniper**: Highest piece capture ratio
- 🔄 **The Grinder**: Most draws
- 🌟 **Opening Hipster**: Most unique opening choices
- 🎪 **Chaos Agent**: Most varied piece activity patterns
- 🧙 **Endgame Wizard**: Longest endgame grind
- 🏃 **Opening Sprinter**: Fastest through the opening
- 🤦 **Blunder King**: Biggest rating swing in a single move (requires Stockfish)

#### Piece Personality Stats
- "Which pieces lived the longest on average?"
- "Most traveled piece" (piece that moved the most squares)
- "Laziest piece" (bishops/knights that barely moved)
- "Suicide squad" (pieces captured earliest on average)

#### Pattern Detection
- "Games featuring an en passant" (very rare, highlight these!)
- "Pawn promotion to [piece]" breakdown
- "Both players castled same side"
- "No castling games"
- "Queen vs Queen trades"

## Technical Implementation Strategy

### Architecture Decision: Pre-computed Stats + JSON

**Recommended Approach:**
1. **Local Processing Script** (Node.js)
   - Fetch PGN data from API after each round
   - Parse with chess.js
   - Compute all statistics
   - Generate JSON files for each round + overall stats
   - Commit JSON files to repository

2. **Static Stats Pages** (Next.js)
   - Read pre-computed JSON files
   - Beautiful data visualization with charts
   - No runtime PGN parsing (fast page loads!)
   - Works perfectly with Vercel static generation

**Why this approach?**
- ✅ Fast page loads (no PGN parsing at runtime)
- ✅ Works with Vercel's serverless limits
- ✅ Easy to version control stats over time
- ✅ Can manually refresh after each round
- ✅ Keeps frontend simple and focused on UI

### Alternative: Runtime Parsing (Not Recommended)

Could parse PGNs on-demand via API route, but:
- ❌ Slower page loads
- ❌ More expensive (compute time)
- ❌ May hit Vercel timeout limits with many games
- ❌ Unnecessary complexity

### Database Schema Changes (Optional)

Could store computed stats in database:
```prisma
model RoundStats {
  id                String   @id @default(cuid())
  roundId           String   @unique
  totalGames        Int
  whiteWins         Int
  blackWins         Int
  draws             Int
  averageGameLength Float
  longestGame       Int
  shortestGame      Int
  totalCaptures     Int
  enPassantCount    Int
  promotionCount    Int
  // ... more fields
  statsJson         Json     // Store full stats as JSON
  round             Round    @relation(fields: [roundId], references: [id])
}
```

**Pros**: Query stats from DB, update automatically
**Cons**: Schema changes, migration complexity, probably overkill

**Recommendation**: Start with JSON files, migrate to DB if needed later

## Implementation Workflow

### Phase 1: Core Stats (MVP)
1. Create `scripts/generate-stats.js` script
2. Implement basic stats calculation (wins, losses, moves, captures)
3. Generate JSON output for Season 2
4. Create `/stats` page with overall stats
5. Test with existing Round 1 data

### Phase 2: Round-Specific Pages
1. Create `/stats/round/[roundNumber]` dynamic route
2. Generate individual round JSON files
3. Add round navigation/comparison features

### Phase 3: Enhanced Stats
1. Add opening detection (simple pattern matching)
2. Implement piece movement analysis
3. Add checkmate pattern detection
4. **Add game phase analysis** (opening/middlegame/endgame lengths)
5. Create "awards" system for fun stats

### Phase 4: Visual Enhancements
1. Add charts/graphs (Chart.js or Recharts)
2. Create PGN viewer for notable games
3. Add animations and interactive elements
4. Mobile-responsive design

### Phase 5: Advanced Features (Future)
1. **Stockfish evaluation integration** (local script only)
   - Analyze each position for evaluation
   - Detect blunders (>200cp swings)
   - Calculate average centipawn loss (ACPL)
   - Identify tactical shots and missed opportunities
2. ECO opening database integration
3. Player-specific statistics
4. Historical comparison across seasons

## File Structure

```
/scripts
  /generate-stats.js          # Main stats generation script
  /opening-detector.js        # Opening name matching
  /stats-calculator.js        # Core calculation logic

/public/stats
  /season-2-overall.json      # All rounds combined
  /season-2-round-1.json      # Round 1 stats
  /season-2-round-2.json      # Round 2 stats
  ...

/app/stats
  /page.tsx                   # Overall stats page
  /round
    /[roundNumber]
      /page.tsx              # Individual round stats

/components/stats
  /StatsCard.tsx             # Reusable stat display
  /StatsChart.tsx            # Chart components
  /AwardBadge.tsx            # Fun award badges
  /PGNViewer.tsx             # Game viewer (optional)
```

## Sample Stats JSON Structure

```json
{
  "roundNumber": 1,
  "seasonNumber": 2,
  "generatedAt": "2025-10-02T...",
  "overview": {
    "totalGames": 16,
    "totalMoves": 1128,
    "averageGameLength": 70.5,
    "longestGame": { "moves": 139, "players": "...", "pgn": "..." },
    "shortestGame": { "moves": 8, "players": "..." }
  },
  "gamePhases": {
    "averageOpening": 17.7,
    "averageMiddlegame": 20.4,
    "averageEndgame": 36.8,
    "longestOpening": { "moves": 20, "game": "..." },
    "longestMiddlegame": { "moves": 33, "game": "..." },
    "longestEndgame": { "moves": 111, "game": "..." }
  },
  "results": {
    "whiteWins": 9,
    "blackWins": 6,
    "draws": 1,
    "whiteWinPercentage": 56.3,
    "blackWinPercentage": 37.5
  },
  "openings": {
    "firstMoves": {
      "e4": { "count": 8, "percentage": 50.0, "winRate": 62.5 },
      "d4": { "count": 6, "percentage": 37.5, "winRate": 50.0 }
    },
    "popularSequences": [
      { "moves": "e4 c5 Nf3", "count": 3, "name": "Sicilian Defense" }
    ]
  },
  "tactics": {
    "totalCaptures": 274,
    "enPassantGames": [],
    "promotions": 1,
    "castling": { "kingside": 22, "queenside": 3 },
    "bloodiestGame": { "captures": 25, "players": "..." },
    "quietestStreak": { "moves": 40, "game": "..." }
  },
  "pieces": {
    "activity": {
      "pawns": 297,
      "knights": 215,
      "rooks": 208,
      "bishops": 166,
      "queens": 155,
      "kings": 157
    },
    "captured": {
      "pawns": 134,
      "bishops": 46,
      "knights": 44,
      "rooks": 32,
      "queens": 18
    },
    "survivalRate": {
      "rooks": 0.5,
      "queens": 0.45,
      "bishops": 0.275,
      "knights": 0.325
    }
  },
  "checkmates": {
    "byPiece": {
      "queen": 5,
      "rook": 3,
      "other": 2
    },
    "fastest": { "moves": 76, "winner": "Black", "game": "..." }
  },
  "awards": {
    "bloodbath": { "game": "...", "captures": 25 },
    "pacifist": { "game": "...", "captures": 8 },
    "speedDemon": { "game": "...", "moves": 76 },
    "endgameWizard": { "game": "...", "endgameMoves": 111 },
    "openingSprinter": { "game": "...", "openingMoves": 8 }
  },
  "blunders": {
    "note": "Requires Stockfish evaluation - implement in Phase 5",
    "biggestBlunder": { "game": "...", "move": "...", "evalSwing": 450 },
    "cleanestGame": { "game": "...", "totalBlunders": 0 }
  }
}
```

## Visualization Ideas

### Charts & Graphs
1. **Win Rate Pie Chart**: White/Black/Draw distribution
2. **Opening Popularity Bar Chart**: Top 10 openings
3. **Game Length Distribution**: Histogram of move counts
4. **Piece Activity Radar Chart**: Compare piece movement
5. **Capture Timeline**: When captures happen in games
6. **Castling Preference**: Kingside vs Queenside visual
7. **Game Phase Breakdown**: Stacked bar chart showing opening/middlegame/endgame lengths
8. **Blunder Timeline**: Plot evaluation swings throughout a game (if Stockfish enabled)

### Interactive Elements
1. **PGN Viewer**: Click to see full game replay
2. **Notable Games Carousel**: Swipe through interesting games
3. **Leaderboard Toggles**: Switch between different stats
4. **Round Comparison**: Compare stats across rounds
5. **Award Showcase**: Animated badge reveals

## Known Limitations & Future Enhancements

### Current Limitations
1. **PGN Parsing Errors**: ~6% failure rate (1/17 games)
   - Solution: Improve PGN normalization before parsing
   
2. **No Position Evaluation**: Can't calculate ACPL without engine
   - Solution: Add Stockfish.js for local analysis scripts
   
3. **Simple Opening Detection**: No ECO codes yet
   - Solution: Integrate ECO database or chess-tools

4. **No Player-Specific Stats**: Currently game-focused only
   - Solution: Link games to players via whitePlayerId/blackPlayerId

### Future Enhancements
1. **Player Statistics Page**: Individual player performance over time
2. **Head-to-Head Records**: Who plays who and results
3. **Rating Performance**: Compare to Lichess ratings
4. **Historical Trends**: Track stats across multiple seasons
5. **Export Features**: Download stats as PDF/CSV
6. **Live Updates**: Real-time stats during tournaments (ambitious!)

## Questions for Product Owner

1. **Priority Stats**: Which stats are most important to show first?
2. **Player Privacy**: Should individual player stats be public or anonymous?
3. **Design Preferences**: Any specific visual style or color scheme?
4. **Update Frequency**: Manual update after each round is OK?
5. **Notable Games**: Should we highlight specific games? Selection criteria?
6. **Awards**: Should awards be serious or fun/silly?
7. **Historical Data**: Do we want to go back and analyze Season 1?

## Next Steps

1. ✅ Review this research document
2. ⏳ Prioritize stats categories (which to implement first)
3. ⏳ Design UI mockups (or go straight to implementation)
4. ⏳ Create `generate-stats.js` script
5. ⏳ Build `/stats` overview page
6. ⏳ Add individual round pages
7. ⏳ Implement charts and visualizations
8. ⏳ Test with all available PGN data
9. ⏳ Deploy and gather feedback

## Implementation Recommendations Summary

### ✅ Recommended for MVP (Phases 1-3)
- **Core stats**: W/L/D, game lengths, captures, piece activity
- **Game phase analysis**: Opening/middlegame/endgame detection
- **Fun stats**: Awards, rare moves (en passant, promotions)
- **Opening tracking**: Simple pattern matching (first 3-6 moves)
- **JSON pre-computation**: Fast, Vercel-friendly, version controlled

### 🔄 Optional Enhancements (Phase 4)
- **Charts & visualizations**: Chart.js or Recharts for graphs
- **PGN viewer**: Interactive game replay
- **Player stats**: Individual performance tracking
- **Opening names**: ECO database integration

### 🚀 Advanced Features (Phase 5 - Future)
- **Blunder detection**: Stockfish evaluation for rating swings
  - **Important**: Run locally only, too heavy for Vercel
  - Process: `scripts/analyze-blunders.js` → generates `blunders.json`
- **ACPL calculation**: Average centipawn loss per game
- **Tactical analysis**: Missed opportunities, brilliant moves

## Quick Start Guide

### 1. Generate Stats After Each Round
```bash
# After round completes, run:
node scripts/generate-stats.js --round 2

# This will:
# - Fetch PGN from /api/broadcast/round/{roundId}/pgn
# - Parse with chess.js
# - Calculate all stats
# - Save to /public/stats/season-2-round-2.json
# - Update /public/stats/season-2-overall.json
```

### 2. View Stats Page
```bash
# Visit:
/stats                    # Overall season stats
/stats/round/1           # Round 1 specific stats
/stats/round/2           # Round 2 specific stats
```

### 3. Optional: Run Blunder Analysis (Local Only)
```bash
# Install Stockfish (one-time)
npm install stockfish

# Analyze round for blunders (takes ~5-10 min)
node scripts/analyze-blunders.js --round 2

# Adds blunder data to round JSON
```

## Tech Stack Recommendations

### Core Dependencies (Already Installed)
- ✅ **chess.js** (1.4.0) - PGN parsing and game analysis
- ✅ **Next.js** (15) - Static site generation
- ✅ **React** (19) - UI components

### Visualization Libraries (To Install)
- **recharts** - Recommended for Next.js, great docs, responsive
  ```bash
  npm install recharts
  ```
- **OR Chart.js** with react-chartjs-2
  ```bash
  npm install chart.js react-chartjs-2
  ```

### Optional Future Libraries
- **stockfish** - For blunder detection (local scripts only)
  ```bash
  npm install stockfish
  ```
- **chess-tools** - ECO opening classification
  ```bash
  npm install chess-tools
  ```

## File Organization

### Scripts Directory
```
/scripts
  /generate-stats.js          # Main stats generator (run after each round)
  /analyze-blunders.js        # Optional Stockfish analysis
  /utils
    /pgn-parser.js           # PGN parsing utilities
    /game-phases.js          # Phase detection logic
    /stats-calculator.js     # Core calculation functions
    /opening-detector.js     # Opening name matching
```

### Stats Data Files
```
/public/stats
  /season-2-overall.json      # Aggregated season stats
  /season-2-round-1.json
  /season-2-round-2.json
  ...
  /season-2-round-7.json
```

### UI Components
```
/app/stats
  /page.tsx                   # Main stats page
  /round/[roundNumber]/page.tsx

/components/stats
  /StatsOverview.tsx         # Overall stats display
  /StatsCard.tsx             # Individual stat card
  /GamePhaseChart.tsx        # Phase breakdown chart
  /OpeningChart.tsx          # Popular openings chart
  /WinRateChart.tsx          # Win/loss/draw pie chart
  /AwardsBadge.tsx           # Fun award badges
  /PGNViewer.tsx             # Game viewer (optional)
```

## Development Workflow

### After Each Round
1. **Wait for all games to be submitted** and verified
2. **Run stats generation**:
   ```bash
   node scripts/generate-stats.js --round [number]
   ```
3. **Review generated JSON** in `/public/stats`
4. **Commit to git**:
   ```bash
   git add public/stats/season-2-round-*.json
   git commit -m "Add stats for Round [number]"
   git push
   ```
5. **Vercel auto-deploys** updated stats

### Optional: Blunder Analysis
1. **Run locally** (don't commit node_modules/stockfish):
   ```bash
   node scripts/analyze-blunders.js --round [number]
   ```
2. **Review blunders** in updated JSON
3. **Commit enhanced JSON** with blunder data

## Performance Considerations

### Why Pre-computed JSON?
- ✅ **Instant page loads**: No PGN parsing at runtime
- ✅ **Vercel-friendly**: No serverless timeouts
- ✅ **CDN cacheable**: Static JSON files served fast
- ✅ **Version controlled**: Track stats changes over time

### Scalability
- **Current round**: ~17 games = ~2KB JSON (tiny!)
- **Full season**: 7 rounds × 17 games = ~14KB total (still tiny!)
- **With blunders**: ~50KB per round (acceptable)
- **Page load**: <100ms to read JSON + render

### Future Scale (Multiple Seasons)
- **Season 3, 4, 5...**: Each gets own JSON files
- **Total size**: Even 10 seasons = <500KB (negligible)
- **Solution**: Lazy load old seasons if needed

## Testing Strategy

### Unit Tests
```javascript
// Test PGN parsing
describe('PGN Parser', () => {
  it('should parse valid PGN correctly', () => {
    const pgn = '[Event "Test"]...';
    const result = parsePGN(pgn);
    expect(result.moves).toHaveLength(50);
  });
});

// Test game phase detection
describe('Game Phase Detector', () => {
  it('should identify opening phase', () => {
    const phases = analyzePhases(chess, history);
    expect(phases.opening).toBeGreaterThan(10);
  });
});
```

### Integration Tests
```javascript
// Test stats generation
describe('Stats Generator', () => {
  it('should generate complete round stats', async () => {
    const stats = await generateRoundStats(1);
    expect(stats.overview.totalGames).toBeGreaterThan(0);
    expect(stats.results.whiteWins).toBeDefined();
  });
});
```

### Manual Testing Checklist
- [ ] Stats generate without errors
- [ ] JSON files have correct structure
- [ ] Stats page loads quickly (<1s)
- [ ] Charts render correctly
- [ ] Mobile responsive
- [ ] Awards display properly
- [ ] Round navigation works

## Error Handling

### PGN Parsing Errors
```javascript
try {
  chess.loadPgn(pgn);
} catch (error) {
  console.warn(`Failed to parse game: ${error.message}`);
  // Skip this game and continue
  return null;
}
```

### Missing Data Handling
```javascript
// Always provide fallbacks
const captures = move.captured ?? 'none';
const result = pgnHeaders.Result ?? 'unknown';
```

### Graceful Degradation
- If a round has no PGN data → Show "No data available yet"
- If stats JSON missing → Display placeholder
- If chart library fails → Show table fallback

## Monitoring & Debugging

### Log Stats Generation
```javascript
console.log(`Processed ${validGames}/${totalGames} games successfully`);
console.log(`Parse errors: ${errors.length}`);
console.log(`Generated stats in ${duration}ms`);
```

### Validate JSON Output
```bash
# Check JSON is valid
node -e "console.log(JSON.parse(require('fs').readFileSync('public/stats/season-2-round-1.json')))"

# Pretty print for review
cat public/stats/season-2-round-1.json | jq .
```

## Deployment Checklist

### Before Each Deploy
- [ ] Run stats generation locally
- [ ] Verify JSON files are valid
- [ ] Test stats page in development
- [ ] Check mobile responsiveness
- [ ] Verify charts render correctly
- [ ] Commit all stats JSON files
- [ ] Push to main branch

### Vercel Configuration
```json
// vercel.json (if needed)
{
  "headers": [
    {
      "source": "/stats/(.*).json",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=3600" }
      ]
    }
  ]
}
```

## Conclusion

The chess.js library provides excellent capabilities for extracting meaningful statistics from PGN data. With a pre-computed JSON approach, we can create a fast, engaging stats page that works perfectly with the Next.js/Vercel stack. The MVP can be implemented quickly, with room for enhancement based on user feedback.

### Key Decisions Made
1. ✅ **Use chess.js** for PGN parsing (JavaScript-native, well-maintained)
2. ✅ **Pre-compute stats** to JSON files (fast, Vercel-friendly)
3. ✅ **Include game phase analysis** (opening/middlegame/endgame)
4. ✅ **Save Stockfish for later** (local scripts only, Phase 5)
5. ✅ **Focus on fun stats** (awards, rare moves, interesting facts)

### Estimated Implementation Time
- **Phase 1** (Core Stats): 4-6 hours
- **Phase 2** (Round Pages): 2-3 hours
- **Phase 3** (Enhanced Stats + Phases): 4-5 hours
- **Phase 4** (Visuals + Charts): 4-6 hours
- **Phase 5** (Blunder Detection): 6-8 hours
- **Total MVP (Phases 1-4)**: ~15-20 hours
- **Full Implementation**: ~25-30 hours

### Success Metrics
- ✅ Stats generation takes <30 seconds per round
- ✅ Stats page loads in <1 second
- ✅ JSON files are <50KB each
- ✅ Mobile responsive with smooth animations
- ✅ Users find stats engaging and fun
- ✅ Zero runtime PGN parsing (all pre-computed)

Let's make chess stats fun! 🎉♟️
