# K4 Classical League Tournament Portal

A comprehensive tournament management system for the K4 Chess Club's Classical League, built with Next.js 15 and modern web technologies.

## Features

### 🏆 Tournament Management
- **Player Registration**: Complete registration system with approval workflow
- **Swiss System Integration**: Links to SwissSystem.org for pairings and standings
- **Round Management**: Automated round scheduling and notifications
- **Result Submission**: Easy game result reporting system
- **Bye Requests**: Player-initiated bye system with admin approval

### 📧 Email Notifications (Postmark)
- **Registration Confirmations**: Welcome emails for new registrations
- **Player Approvals**: Notification when registration is approved
- **Round Pairings**: Automated notifications when new rounds are published
- **Bye Confirmations**: Approval notifications for bye requests
- **Tournament Links**: Dynamic tournament links from admin settings

### 👨‍💼 Admin Features
- **Player Management**: Approve registrations, manage withdrawals
- **Bye Request Review**: Approve/reject bye requests
- **Result Processing**: Review and process submitted results
- **Round Notifications**: Send pairing emails to all players
- **Settings Management**: Configure tournament links and seasons

### 🎨 User Experience
- **Responsive Design**: Mobile-first design with dark mode support
- **Player Directory**: Contact information with WhatsApp integration
- **Real-time Previews**: Player card preview during registration
- **Tournament Status**: Live round information and deadlines

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with admin roles
- **Styling**: Tailwind CSS with custom fonts (Syne Tactile for nicknames)
- **Email**: Postmark API for transactional emails
- **Deployment**: Designed for production deployment

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Postmark account for email notifications

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd classical-league
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Configure the following variables in `.env.local`:
```
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
POSTMARK_API_KEY="your-postmark-api-key"
```

4. Set up the database:
```bash
npm run db:migrate:dev
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── players/           # Player-related pages
│   └── ...
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
│   ├── auth.ts           # Authentication configuration
│   ├── db.ts             # Database connection
│   ├── email.ts          # Email notification system
│   └── validations.ts    # Form validation schemas
├── prisma/               # Database schema and migrations
└── public/              # Static assets
```

## Key Features Detail

### Email Notification System
The application includes a comprehensive email system using Postmark:

- **Registration Flow**: Automatic welcome emails with tournament information
- **Approval Workflow**: Professional approval notifications with tournament links
- **Round Management**: Mass notifications to all players when pairings are published
- **Player Communication**: Directory with WhatsApp integration for easy contact

### Admin Panel
Comprehensive admin interface at `/admin` with:

- **Dashboard**: Overview of tournament status and pending actions
- **Player Management**: Registration approvals and player information
- **Round Management**: Send pairing notifications and manage rounds
- **Settings**: Configure tournament links and season management

### Swiss Integration
Seamless integration with SwissSystem.org:

- **Dynamic Links**: Tournament links configurable via admin panel
- **Round Information**: Real-time round status and deadlines
- **Player Directory**: Contact information for opponent communication

## Environment Configuration

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js session encryption
- `NEXTAUTH_URL`: Application base URL
- `POSTMARK_API_KEY`: Postmark API key for email notifications

### Email Configuration
Email sender address is configured as `check@schachklub-k4.ch` in `lib/email.ts`.

## Database Schema

The application uses Prisma ORM with the following main models:
- **Season**: Tournament seasons with rounds
- **Player**: Registered players with ratings and status
- **Round**: Tournament rounds with dates and deadlines
- **ByeRequest**: Player bye requests with approval status
- **GameResult**: Submitted game results
- **Settings**: Global tournament configuration

## Development

### Database Operations

**Production Migration Workflow:**
```bash
# 1. Create new migration (development only)
npm run db:migrate:dev

# 2. Test locally
npm run dev
npm run db:studio

# 3. Push to main branch - Vercel auto-deploys migrations
git push origin main
```

**Development Commands:**
```bash
# Create new migration
npm run db:migrate:dev

# Deploy existing migrations
npm run db:migrate:deploy

# Prototype schema changes (no migration)
npm run db:push

# View database
npm run db:studio

# Seed with test data
npm run db:seed
```

### Statistics Generation

Generate comprehensive round statistics from PGN data:

```bash
# 1. Download latest PGN from broadcast API
curl -o /tmp/round1-fresh.pgn https://classical.schachklub-k4.ch/api/broadcast/round/cmfekevr50001l5045y65op37/pgn

# 2. Generate statistics JSON
node scripts/generate-stats.js --round 1

# 3. Stats are saved to public/stats/season-2-round-1.json
# 4. View at http://localhost:3000/stats
```

**Features:**
- Game overview (total games, average length, longest/shortest games)
- Game phases (opening, middlegame, endgame analysis)
- Results breakdown (white/black win percentages)
- Opening analysis (first moves, popular sequences)
- Tactical statistics (captures, castling, promotions, en passant)
- Piece activity and survival rates
- Checkmate analysis
- Board heatmap (most popular and bloodiest squares)
- Game awards (bloodbath, pacifist, speed demon, etc.)

**Migration Rules:**
- ✅ Always use `db:migrate:dev` for schema changes
- ✅ Test migrations locally before pushing to main
- ✅ Handle nullable fields in TypeScript code
- ❌ Never use `db:push` in production
- ❌ Never edit existing migration files

### Email Testing
The application includes email testing capabilities for development and verification.

## Deployment

### Production Setup
The application is deployed at [classical.schachklub-k4.ch](https://classical.schachklub-k4.ch) with:

- **Database**: Neon PostgreSQL serverless database
- **Email**: Postmark API for transactional emails
- **Hosting**: Vercel with automatic deployments from main branch
- **SEO**: Complete Open Graph and Twitter Card metadata
- **Security**: Admin authentication with bcrypt password hashing

### Initial Production Setup
1. **Database Migrations**: Automatic via Vercel build process (`vercel-build` script)
2. **Admin Creation**: Visit `/api/admin/create-admin` to create initial admin user
3. **Season Setup**: Use admin panel to configure current season settings
4. **Tournament Links**: Configure SwissSystem.org links in admin settings

**Note**: Database schema is automatically created and updated through Prisma migrations during deployment.

## Contributing

1. Follow the existing code style and patterns
2. Test email functionality thoroughly
3. Ensure database migrations are included
4. Update documentation for new features

## License

Private project for K4 Chess Club.