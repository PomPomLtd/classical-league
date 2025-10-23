# K4 Classical League Tournament Portal

A comprehensive tournament management system for the K4 Chess Club's Classical League, built with Next.js 15 and modern web technologies.

## Features

### 🏆 Tournament Management
- **Player Registration**: Complete registration system with approval workflow
- **Swiss System Integration**: Links to SwissSystem.org for pairings and standings
- **Round Management**: Automated round scheduling and notifications
- **Result Submission**: Easy game result reporting with PGN validation
- **Bye Requests**: Player-initiated bye system with admin approval

### 📊 Advanced Statistics System
- **Comprehensive Game Analysis**: Detailed statistics from PGN data with chess.js
- **Stockfish Analysis**: Accuracy, blunders, mistakes, comebacks, and lucky escapes
- **Season Overview**: Aggregated stats, Hall of Fame, Player Leaderboards, Trends
- **Piece Cemetery**: Creative graveyard visualization with 1,100+ captured pieces
- **ECO Opening Classification**: 3,546+ openings from Lichess database
- **Interactive Visualizations**: Charts, graphs, and board heatmaps
- **Fun Statistics**: 11 creative awards including Opening Hipster, Sporty Queen, Dadbod Shuffler
- **Multi-Phase Analysis**: Opening, middlegame, and endgame breakdowns
- **Dark Mode Support**: Full theme support across all visualizations

### 📧 Email Notifications (Postmark)
- **Registration Confirmations**: Welcome emails for new registrations
- **Player Approvals**: Notification when registration is approved
- **Round Pairings**: Automated notifications when new rounds are published
- **Bye Confirmations**: Approval notifications for bye requests
- **Tournament Links**: Dynamic tournament links from admin settings

### 👨‍💼 Admin Features
- **Player Management**: Approve registrations, manage withdrawals
- **Bye Request Review**: Approve/reject bye requests
- **Result Processing**: Review and process submitted results with PGN
- **Round Notifications**: Send pairing emails to all players
- **Settings Management**: Configure tournament links and seasons

### 🎨 User Experience
- **Responsive Design**: Mobile-first design with dark mode support
- **Player Directory**: Contact information with WhatsApp integration
- **Real-time Previews**: Player card preview during registration
- **Tournament Status**: Live round information and deadlines

## Tech Stack

- **Framework**: Next.js 15 (App Router) with React 19
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with admin roles
- **Styling**: Tailwind CSS 4 with custom fonts (Syne Tactile)
- **Email**: Postmark API for transactional emails
- **Charts**: Recharts for data visualization
- **Chess Analysis**: chess.js for PGN parsing and game analysis
- **Deployment**: Vercel with Neon PostgreSQL

## Quick Start

### Local Development Setup (Recommended)

The easiest way to get started is using the automated setup script:

```bash
# 1. Clone and install
git clone <repository-url>
cd classical-league
npm install

# 2. Run automated setup (starts Prisma dev server, sets up DB, seeds data)
npm run setup:local

# 3. In a new terminal, start Next.js
npm run dev
```

**What gets created:**
- ✅ Local Prisma dev server on localhost (named instance: `classical-league`)
- ✅ `.env` file with connection string
- ✅ Database with Season 2 and 7 rounds
- ✅ 10 test players (Magnus Carlsen, Garry Kasparov, etc.)
- ✅ Admin user: `admin` / `SchachKreis4Admin2025!`

**Access the application:**
- Main app: http://localhost:3000
- Admin panel: http://localhost:3000/admin-auth
- Prisma Studio: `npm run db:studio`

### Manual Setup (Alternative)

If you prefer manual control:

```bash
# Terminal 1 - Start Prisma dev server (keep running)
npm run db:dev

# Terminal 2 - Manual setup
# 1. Update .env with DATABASE_URL from Terminal 1 output
# 2. Run manual setup script
npm run setup:manual

# 3. Start development server
npm run dev
```

See `LOCAL_SETUP.md` for complete documentation.

### Production Environment

For production deployment, configure these environment variables:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# Admin Credentials
ADMIN_USERNAME="your-admin-username"
ADMIN_PASSWORD="your-secure-password"

# Email (Postmark)
POSTMARK_API_KEY="your-postmark-api-key"
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── players/           # Player-related pages
│   ├── stats/             # Statistics pages
│   └── ...
├── components/            # Reusable UI components
│   ├── stats/            # Statistics visualization components
│   └── ...
├── lib/                   # Utility functions and configurations
│   ├── auth-config.ts    # NextAuth configuration
│   ├── db.ts             # Database connection
│   ├── email.ts          # Email notification system
│   └── validations.ts    # Form validation schemas
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database models
│   ├── migrations/       # Migration files
│   └── seed.ts          # Database seeding
├── scripts/              # Utility scripts
│   ├── generate-stats.js # Statistics generator
│   └── utils/           # Helper utilities
│       ├── pgn-parser.js
│       ├── stats-calculator.js
│       ├── game-phases.js
│       └── chess-openings.js (3,546 ECO openings)
└── public/              # Static assets
    └── stats/           # Generated statistics JSON
```

## Statistics System

The application includes a comprehensive statistics system that analyzes chess games from PGN data.

### Features

**Game Analysis:**
- Overview statistics (total games, average length, longest/shortest)
- Game phase detection (opening, middlegame, endgame)
- Results breakdown with win percentages
- Win rate pie chart visualization

**Opening Analysis:**
- ECO code classification (3,546+ openings from Lichess)
- First move popularity with win rates
- Opening variations with proper chess notation (1.e4 c5 2.Nf3)
- Interactive bar chart for opening popularity
- "Show All" pagination (5 default, expandable)

**Tactical Statistics:**
- Total captures and capture sequences
- Castling statistics (kingside vs queenside)
- Pawn promotions
- En passant occurrences
- Check sequences (King Hunt award)

**Board Analysis:**
- Interactive board heatmap
- Most popular squares
- Bloodiest squares (most captures)
- Quietest squares

**Piece Statistics:**
- Piece activity (moves per piece type)
- Capture statistics
- Survival rates
- Checkmate piece analysis

**Fun Statistics (11 Awards):**
1. ⚡ **Fastest Queen Trade** - Queens traded earliest
2. 🐌 **Slowest Queen Trade** - Queens kept longest
3. 🔪 **Longest Capture Spree** - Most consecutive captures
4. 👑 **Longest King Hunt** - Most consecutive checks
5. 🌪️ **Pawn Storm** - Most pawn moves in opening
6. 🏠 **Piece Loyalty** - Piece on same square 30+ moves
7. ✈️ **Square Tourist** - Piece visiting most squares
8. 🏁 **Castling Race** - Who castled first
9. 🎩 **Opening Hipster** - Most obscure opening
10. 👸 **Sporty Queen** - Queen traveling most distance
11. 👑 **Dadbod Shuffler** - Most active king

### Generating Statistics

```bash
# Generate round stats (fetches PGN from API)
curl -s "https://classical.schachklub-k4.ch/api/broadcast/round/{roundId}/pgn" | \
  node scripts/generate-stats.js --round 1 --analyze

# From local PGN file with Stockfish analysis
cat round1.pgn | node scripts/generate-stats.js --round 1 --analyze

# Generate season overview (after 2+ rounds completed)
node scripts/generate-overview.js --season 2

# View generated stats
# Round stats: public/stats/season-2-round-1.json → http://localhost:3000/stats/round/1
# Season overview: public/stats/season-2-overview.json → http://localhost:3000/stats/overview
```

**Performance:**
- ✅ 100% PGN parsing success rate (31/31 games Round 1, 33/33 games Round 2)
- ✅ Round stats: 30-45s (basic), 7-15min (with Stockfish)
- ✅ Season overview: <5s (aggregates existing rounds)
- ✅ Output files: 35-66KB per round, ~50KB for overview
- ✅ Static JSON for fast page loads

### Statistics Architecture

**Round Statistics Components** (15 modular components in `/components/stats/`):
- `round-header.tsx` - Navigation and broadcast link
- `overview-stats.tsx` - Game overview metrics
- `results-breakdown.tsx` - Win/loss/draw with pie chart
- `awards-section.tsx` - Tournament awards
- `fun-stats.tsx` - 11 fun statistics
- `game-phases.tsx` - Phase analysis
- `tactics-section.tsx` - Tactical metrics
- `openings-section.tsx` - Opening analysis with charts
- `piece-stats.tsx` - Piece activity
- `notable-games.tsx` - Interesting games
- `checkmates-section.tsx` - Checkmate analysis
- `board-heatmap-section.tsx` - Interactive heatmap
- `opening-popularity-chart.tsx` - Bar chart
- `win-rate-chart.tsx` - Pie chart
- `stat-card.tsx` - Reusable wrapper

**Season Overview Components** (5 components in `/components/stats/overview/`):
- `overview-hero.tsx` - Season stats hero section
- `piece-cemetery.tsx` - Creative graveyard with captured pieces
- `hall-of-fame-section.tsx` - Best awards from all rounds
- `leaderboards-section.tsx` - Player performance rankings
- `trends-section.tsx` - Statistics trends across rounds

**Round Stats Utilities** (`/scripts/utils/`):
- `pgn-parser.js` - Parse PGN with chess.js
- `game-phases.js` - Detect opening/middlegame/endgame (Lichess approach)
- `stats-calculator.js` - Calculate all statistics
- `chess-openings.js` - ECO opening database (3,546 openings)
- `build-openings-db.js` - Build opening database from Lichess TSV

**Season Overview Utilities** (`/scripts/utils/overview/`):
- `load-round-data.js` - Load and validate round JSON files
- `aggregate-totals.js` - Aggregate statistics across rounds
- `find-hall-of-fame.js` - Extract best awards from all rounds
- `track-players.js` - Track player appearances and performance
- `calculate-trends.js` - Calculate round-by-round trends
- `generate-leaderboards.js` - Generate player rankings

**Data Source:**
- Lichess chess-openings database (CC0 Public Domain)
- https://github.com/lichess-org/chess-openings

## Database Operations

### Development Commands

```bash
# Local development setup
npm run setup:local          # Automated: Prisma dev + DB setup + seeding
npm run db:dev              # Start Prisma dev server (keep running)
npm run db:dev:stop         # Stop Prisma dev server
npm run db:dev:remove       # Remove local database instance

# Manual setup
npm run setup:manual        # Manual: migrations + seeding (requires db:dev running)

# Database operations
npm run db:migrate:dev      # Create new migration (development)
npm run db:migrate:deploy   # Deploy migrations (production)
npm run db:push             # Push schema without migration (prototyping only)
npm run db:studio           # Open Prisma Studio
npm run db:seed             # Seed database with test data

# Generate Prisma client
npx prisma generate
```

### Production Migration Workflow

```bash
# 1. Create migration locally
npm run db:migrate:dev

# 2. Test with development server
npm run dev
npm run db:studio

# 3. Build to verify TypeScript compatibility
npm run build

# 4. Push to main - Vercel auto-deploys with migrations
git push origin main
```

**Migration Rules:**
- ✅ Always use `db:migrate:dev` for schema changes
- ✅ Test migrations locally before pushing
- ✅ Handle nullable fields in TypeScript
- ✅ Make migrations backward compatible when possible
- ❌ Never use `db:push` in production
- ❌ Never edit existing migration files
- ❌ Never delete migration files from git

### Neon CLI (Production Database)

The Neon CLI is authenticated and available for production database management:

```bash
neon                        # Access Neon CLI
neon databases list         # List all databases
neon sql-editor            # Open SQL editor
```

## Key Features Detail

### Email Notification System
Comprehensive email system using Postmark with sender `check@schachklub-k4.ch`:

- **Registration Flow**: Automatic welcome emails with tournament information
- **Approval Workflow**: Professional approval notifications with tournament links
- **Round Management**: Mass notifications to all players when pairings are published
- **Player Communication**: Directory with WhatsApp integration for easy contact

### Admin Panel
Comprehensive admin interface at `/admin` with:

- **Dashboard**: Overview of tournament status and pending actions
- **Player Management**: Registration approvals and player information
- **Round Management**: Send pairing notifications and manage rounds
- **Result Processing**: Verify submitted PGN and assign results
- **Settings**: Configure tournament links and season management

### PGN Validation
Robust PGN handling with normalization:
- Automatic header completion (Event, Site, Date, Round, White, Black, Result)
- Blank line insertion for proper formatting
- Error handling with detailed warnings
- Compatible with various PGN export formats

## Troubleshooting

### Local Setup Issues

**Database connection issues:**
```bash
# Reset everything and start fresh
npm run db:dev:stop
npm run db:dev:remove
npm run setup:local
```

**Check migrations status:**
```bash
npx prisma migrate status
```

**View database:**
```bash
npm run db:studio
```

### Statistics Generation Issues

**PGN parsing fails:**
- Ensure PGN has required headers (Event, Site, Date, Round, White, Black, Result)
- Check for malformed move notation
- View detailed error output in console

**Missing opening names:**
- Verify chess-openings.js exists in scripts/utils/
- Rebuild if needed: `node scripts/utils/build-openings-db.js`

## Deployment

### Production Setup (Vercel)

The application is deployed at [classical.schachklub-k4.ch](https://classical.schachklub-k4.ch) with:

- **Hosting**: Vercel with automatic deployments from main branch
- **Database**: Neon PostgreSQL serverless database
- **Email**: Postmark API for transactional emails
- **Auto-migrations**: Database schema updated automatically via `vercel-build` script
- **SEO**: Complete Open Graph and Twitter Card metadata
- **Security**: Admin authentication with bcrypt password hashing

### Initial Production Setup

1. **Configure Environment Variables**: Set all required variables in Vercel dashboard
2. **Deploy**: Push to main branch for automatic deployment
3. **Database**: Migrations run automatically during build
4. **Admin User**: Visit `/api/admin/create-admin` to create initial admin
5. **Season Setup**: Use admin panel to configure current season
6. **Tournament Links**: Configure SwissSystem.org links in settings
7. **Generate Stats**: Run stats generation script for each completed round

## Documentation

- `LOCAL_SETUP.md` - Comprehensive local development setup guide
- `DATABASE_MIGRATIONS.md` - Database migration workflow and troubleshooting
- `STATS.md` - Statistics system research and implementation
- `STATS-PROGRESS.md` - Development progress and achievements
- `CLAUDE.md` - Project guidelines for AI assistance

## Contributing

1. Follow the existing code style and patterns
2. Test email functionality thoroughly
3. Ensure database migrations are included
4. Update documentation for new features
5. Run `npm run build` before pushing to verify TypeScript compilation

## License

Private project for K4 Chess Club.
