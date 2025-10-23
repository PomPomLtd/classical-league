# Season Overview Stats - Implementation Plan

## Overview
Generate aggregate statistics across all rounds for Season 2, with Hall of Fame awards, player tracking, and trend analysis.

## Goals
- ✅ Fast static JSON generation (not computed client-side)
- ✅ Track individual players across rounds
- ✅ Hall of Fame for best/worst/most extreme stats
- ✅ Good balance of serious and fun stats
- ✅ Charts for trends using recharts
- ✅ Clean, maintainable, extendable architecture

---

## Data Structure

### Output: `public/stats/season-2-overview.json`

```json
{
  "seasonNumber": 2,
  "generatedAt": "2025-10-23T...",
  "roundsIncluded": [1, 2, 3, 4, 5, 6, 7],

  "aggregates": {
    "totalGames": 210,
    "totalMoves": 8500,
    "averageGameLength": 40.5,
    "totalQueenDistance": 3500,
    "totalQueenDistanceKm": "14.2km",
    "totalQueenDistanceHumanScale": "263m",
    "totalBlunders": 145,
    "totalMistakes": 320,
    "piecesCaptured": {
      "pawns": 850,
      "knights": 245,
      "bishops": 240,
      "rooks": 198,
      "queens": 87,
      "total": 1620
    },
    "totalChecks": 1200,
    "totalEnPassant": 15,
    "totalPromotions": 45
  },

  "hallOfFame": {
    "cleanestGame": {
      "round": 2,
      "white": "Player A",
      "black": "Player B",
      "combinedACPL": 25.3,
      "whiteACPL": 12.5,
      "blackACPL": 12.8
    },
    "wildestGame": { /* similar */ },
    "biggestBlunder": {
      "round": 1,
      "player": "Player C",
      "white": "...",
      "black": "...",
      "cpLoss": 850,
      "move": "Qxf7",
      "moveNumber": 15
    },
    "mostAccurate": {
      "round": 3,
      "player": "Player D",
      "accuracy": 98.5,
      "acpl": 8.2
    },
    "worstACPL": { /* similar */ },
    "longestGame": {
      "round": 2,
      "moves": 81,
      "white": "...",
      "black": "..."
    },
    "shortestGame": { /* similar */ },
    "sportiestQueen": {
      "round": 1,
      "distance": 68,
      "distanceCm": 306,
      "distanceHumanScale": "56m",
      "player": "..."
    },
    "mostRetreats": { /* similar */ },
    "mostChecks": { /* similar */ },
    "longestCaptureSpree": { /* similar */ },
    "earliestCastling": { /* similar */ },
    "mostObscureOpening": { /* similar */ },
    "biggestComeback": { /* similar */ }
  },

  "playerStats": {
    "Boris G.": {
      "normalizedName": "Boris G.",
      "displayName": "Boris «Out of Nowhere» G.",
      "gamesPlayed": 7,
      "gamesAsWhite": 3,
      "gamesAsBlack": 4,
      "wins": 4,
      "losses": 2,
      "draws": 1,
      "winRate": 57.1,
      "awards": [
        { "round": 2, "award": "Chicken Award", "details": "25 retreats" },
        { "round": 5, "award": "Sporty Queen", "details": "52 squares" }
      ],
      "awardCount": 2,
      "averageACPL": 85.5,
      "bestACPL": 45.2,
      "worstACPL": 125.3,
      "acplByRound": [85, 90, 75, null, 82, 95, 88],
      "accuracyByRound": [85, 88, 92, null, 87, 83, 90],
      "openingsUsed": ["C55", "B01", "E61", "C50"],
      "openingDiversity": 4,
      "favoriteOpening": "C55",
      "totalBlunders": 8,
      "totalMistakes": 15
    }
    // ... other players
  },

  "leaderboards": {
    "mostAwards": [
      { "player": "Boris G.", "displayName": "...", "count": 5 },
      { "player": "Alice S.", "displayName": "...", "count": 4 }
    ],
    "bestAverageACPL": [
      { "player": "Magnus C.", "displayName": "...", "acpl": 42.3 },
      { "player": "Garry K.", "displayName": "...", "acpl": 45.8 }
    ],
    "mostImproved": [
      {
        "player": "Noob N.",
        "displayName": "...",
        "round1ACPL": 120,
        "round7ACPL": 65,
        "improvement": 55
      }
    ],
    "mostGames": [
      { "player": "Iron Man I.", "displayName": "...", "games": 7 }
    ],
    "mostVersatile": [
      { "player": "Hipster H.", "displayName": "...", "openingsUsed": 7 }
    ],
    "mostConsistent": [
      {
        "player": "Steady S.",
        "displayName": "...",
        "averageACPL": 75,
        "variance": 5.2
      }
    ]
  },

  "trends": {
    "averageACPLByRound": [85.5, 82.3, 80.1, 78.5, 77.2, 79.0, 76.5],
    "averageAccuracyByRound": [80, 82, 84, 85, 86, 85, 87],
    "averageGameLengthByRound": [42, 38, 40, 39, 41, 37, 38],
    "e4PercentageByRound": [75, 80, 72, 78, 82, 70, 75],
    "d4PercentageByRound": [20, 15, 25, 18, 15, 25, 20],
    "drawRateByRound": [10, 6, 8, 12, 5, 9, 7],
    "whiteWinRateByRound": [52, 48, 55, 50, 58, 45, 51],
    "blackWinRateByRound": [38, 46, 37, 38, 37, 46, 42],
    "blundersPerGameByRound": [2.5, 2.2, 2.0, 1.8, 1.9, 2.1, 1.7],
    "avgQueenDistanceByRound": [48, 52, 45, 50, 55, 47, 49]
  },

  "awardFrequency": {
    "Chicken Award": { "appearances": 7, "percentage": 100 },
    "Sporty Queen": { "appearances": 7, "percentage": 100 },
    "Rook Lift": { "appearances": 5, "percentage": 71.4 },
    "Center Stage": { "appearances": 6, "percentage": 85.7 },
    "most": "Chicken Award",
    "least": "Rook Lift"
  }
}
```

---

## Architecture

### 1. Script: `scripts/generate-overview.js`

**Usage:**
```bash
node scripts/generate-overview.js --season 2
# Output: public/stats/season-2-overview.json
```

**Structure:**
```javascript
const { loadRoundData } = require('./utils/overview/data-loader')
const { aggregateTotals } = require('./utils/overview/aggregate-totals')
const { findHallOfFame } = require('./utils/overview/hall-of-fame')
const { trackPlayers } = require('./utils/overview/player-tracker')
const { calculateTrends } = require('./utils/overview/trends')
const { analyzeAwardFrequency } = require('./utils/overview/award-frequency')
const { generateLeaderboards } = require('./utils/overview/leaderboards')

async function main() {
  // 1. Load all round JSONs
  const rounds = await loadRoundData(2)

  // 2. Calculate various stats
  const aggregates = aggregateTotals(rounds)
  const hallOfFame = findHallOfFame(rounds)
  const playerStats = trackPlayers(rounds)
  const trends = calculateTrends(rounds)
  const awardFrequency = analyzeAwardFrequency(rounds)
  const leaderboards = generateLeaderboards(playerStats)

  // 3. Combine and output
  const overview = {
    seasonNumber: 2,
    generatedAt: new Date().toISOString(),
    roundsIncluded: rounds.map(r => r.roundNumber),
    aggregates,
    hallOfFame,
    playerStats,
    leaderboards,
    trends,
    awardFrequency
  }

  fs.writeFileSync(
    `public/stats/season-2-overview.json`,
    JSON.stringify(overview, null, 2)
  )
}
```

### 2. Utilities Structure

```
scripts/utils/overview/
├── data-loader.js          # Load all round JSONs
├── player-normalizer.js    # Normalize player names
├── aggregate-totals.js     # Sum up totals
├── hall-of-fame.js         # Find superlatives
├── player-tracker.js       # Track individual players
├── trends.js               # Calculate trends over rounds
├── award-frequency.js      # Award appearance stats
├── leaderboards.js         # Generate top-N lists
└── index.js                # Export all
```

### 3. Player Name Normalization

**Challenge:** Match "Boris «Out of Nowhere» G." across rounds even if nickname changes.

**Solution:**
```javascript
// player-normalizer.js
function normalizePlayerName(fullName) {
  // Remove nickname (text between « »)
  return fullName.replace(/«[^»]+»\s*/g, '').trim()
  // "Boris «Out of Nowhere» G." -> "Boris G."
}

function getDisplayName(playerAppearances) {
  // Use most recent appearance
  return playerAppearances[playerAppearances.length - 1]
}
```

### 4. Hall of Fame Calculator

```javascript
// hall-of-fame.js
function findHallOfFame(rounds) {
  let cleanestGame = null
  let biggestBlunder = null
  // ... etc

  rounds.forEach((round, idx) => {
    // Check cleanest game
    if (round.analysis?.summary?.lowestCombinedACPL) {
      const game = round.analysis.summary.lowestCombinedACPL
      if (!cleanestGame || game.combinedACPL < cleanestGame.combinedACPL) {
        cleanestGame = {
          round: round.roundNumber,
          ...game
        }
      }
    }

    // Check biggest blunder
    if (round.analysis?.summary?.biggestBlunder) {
      const blunder = round.analysis.summary.biggestBlunder
      if (!biggestBlunder || blunder.cpLoss > biggestBlunder.cpLoss) {
        biggestBlunder = {
          round: round.roundNumber,
          ...blunder
        }
      }
    }

    // ... check all other superlatives
  })

  return {
    cleanestGame,
    biggestBlunder,
    // ... all hall of fame entries
  }
}
```

### 5. Player Tracker

```javascript
// player-tracker.js
function trackPlayers(rounds) {
  const playerMap = new Map()

  rounds.forEach(round => {
    // Track awards
    if (round.funStats) {
      Object.entries(round.funStats).forEach(([awardName, data]) => {
        if (data) {
          trackAward(playerMap, round.roundNumber, awardName, data)
        }
      })
    }

    // Track Stockfish analysis
    if (round.analysis?.games) {
      round.analysis.games.forEach(game => {
        trackGamePerformance(playerMap, round.roundNumber, game)
      })
    }
  })

  // Convert to object and calculate derived stats
  return Object.fromEntries(playerMap)
}
```

---

## UI Implementation

### Page: `/app/stats/overview/page.tsx`

**Sections:**

1. **Hero Banner** - Big aggregate numbers
2. **Hall of Fame** - Grid of superlatives (like awards section)
3. **Trends Charts** - Line/bar charts showing evolution
4. **Player Leaderboards** - Tabs for different rankings
5. **Award Frequency** - Fun "stat stats"

**Components:**

```
components/stats/overview/
├── overview-hero.tsx          # Aggregate totals
├── hall-of-fame-section.tsx   # Superlatives grid
├── trends-section.tsx          # Charts
├── leaderboards-section.tsx    # Top players
└── award-frequency-section.tsx # Award stats
```

### Update Main Stats Page

Add prominent "Season Overview" card above round cards:

```tsx
<Link href="/stats/overview">
  <div className="bg-gradient-to-br from-purple-600 to-indigo-600 ...">
    <h2>🏆 Season 2 Overview</h2>
    <p>Hall of Fame, Player Stats & Trends</p>
  </div>
</Link>
```

---

## Implementation Steps

### Phase 1: Data Processing (Backend)
1. ✅ Create `scripts/utils/overview/` directory
2. ✅ Implement `player-normalizer.js`
3. ✅ Implement `data-loader.js`
4. ✅ Implement `aggregate-totals.js`
5. ✅ Implement `hall-of-fame.js`
6. ✅ Implement `player-tracker.js`
7. ✅ Implement `trends.js`
8. ✅ Implement `award-frequency.js`
9. ✅ Implement `leaderboards.js`
10. ✅ Create main `scripts/generate-overview.js`
11. ✅ Test with existing Round 1 & 2 data
12. ✅ Generate `season-2-overview.json`

### Phase 2: UI Components (Frontend)
13. ✅ Create TypeScript interfaces for overview data
14. ✅ Create `overview-hero.tsx` component
15. ✅ Create `hall-of-fame-section.tsx` component
16. ✅ Create `trends-section.tsx` with recharts
17. ✅ Create `leaderboards-section.tsx` with tabs
18. ✅ Create `award-frequency-section.tsx`
19. ✅ Create main `/app/stats/overview/page.tsx`
20. ✅ Update `/app/stats/page.tsx` with overview link
21. ✅ Test responsive design
22. ✅ Test dark mode

### Phase 3: Polish & Documentation
23. ✅ Add loading states
24. ✅ Add error handling
25. ✅ Update `CLAUDE.md` with overview generation commands
26. ✅ Test full workflow
27. ✅ Commit & push

---

## Example Commands

```bash
# Generate overview after all rounds are complete
node scripts/generate-overview.js --season 2

# Or pipe through to regenerate
cat public/stats/season-2-round-*.json | \
  node scripts/generate-overview.js --season 2

# View locally
# http://localhost:3000/stats/overview
```

---

## Extensibility Considerations

### Adding New Hall of Fame Entries
Just add to `hall-of-fame.js`:
```javascript
// Find fastest checkmate
if (round.checkmates?.fastestMate) {
  // ... comparison logic
}
```

### Adding New Player Stats
Just extend in `player-tracker.js`:
```javascript
// Track opening repertoire
player.openingsAsWhite = [...]
player.openingsAsBlack = [...]
```

### Adding New Trends
Just add to `trends.js`:
```javascript
trends.promotionsPerGameByRound.push(
  round.tactics.promotions.total / round.overview.totalGames
)
```

### Adding New Leaderboards
Just add to `leaderboards.js`:
```javascript
leaderboards.mostCheckmates = Object.entries(playerStats)
  .map(/* ... */)
  .sort((a, b) => b.checkmates - a.checkmates)
  .slice(0, 10)
```

---

## Testing Plan

1. **Unit Tests** (if time permits)
   - Player name normalization edge cases
   - Hall of fame comparison logic
   - Aggregate calculations

2. **Integration Testing**
   - Generate overview with Round 1 & 2 data
   - Verify all sections populated
   - Check player tracking accuracy

3. **UI Testing**
   - Responsive breakpoints
   - Dark mode compatibility
   - Chart rendering
   - Loading states

---

## Success Criteria

- ✅ Overview JSON generated in <5 seconds
- ✅ Page loads in <1 second (static JSON)
- ✅ All 7 rounds data incorporated
- ✅ Player names matched correctly across rounds
- ✅ Hall of Fame shows most extreme stats
- ✅ Trends show evolution over time
- ✅ Leaderboards highlight top players
- ✅ Mobile responsive
- ✅ Dark mode support
- ✅ Code is modular and extensible

---

## Notes

- Player name matching assumes nickname format stays consistent `«nickname»`
- If player changes name completely, they'll appear as different player
- Could add manual mapping file later if needed
- Overview should be regenerated after each new round stats generation
