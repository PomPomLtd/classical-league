# Local Development Setup Guide

This guide provides everything you need to get the Classical League project running locally in minutes.

## Quick Start (Recommended)

The easiest way to set up your local environment:

```bash
npm run setup:local
```

This automated script will:
- ✅ Check Node.js version (requires 20+)
- 🚀 Start Prisma dev server automatically
- 📝 Update your `.env` file with connection string
- 📦 Install dependencies
- 🗄️ Set up and seed the database
- 🎉 Keep the database server running for you

**That's it!** Once complete, open a new terminal and run `npm run dev`.

## Manual Setup (Alternative)

If you prefer manual control or the automated script doesn't work:

### Step 1: Start Prisma Dev Server

In a **separate terminal window** (keep it running):

```bash
npm run db:dev
# or manually: npx prisma dev --name classical-league
```

You'll see output like:
```
✔ Great Success! 😉👍
Your prisma dev server classical-league is ready and listening on ports 51213-51215.

DATABASE_URL="prisma+postgres://localhost:51213/?api_key=..."
```

### Step 2: Update Environment

Copy the `DATABASE_URL` from the output above and update your `.env` file:

```bash
# Copy example file if needed
cp .env.example .env

# Then edit .env and paste the DATABASE_URL
```

### Step 3: Run Manual Setup

```bash
npm run setup:manual
```

This will install dependencies, set up the database, and seed it with test data.

## Available Commands

### Setup Commands
- `npm run setup:local` - **Recommended**: Fully automated setup
- `npm run setup:manual` - Manual setup (requires Prisma dev server running)

### Database Commands
- `npm run db:dev` - Start Prisma dev server
- `npm run db:dev:stop` - Stop Prisma dev server
- `npm run db:dev:remove` - Remove local database instance
- `npm run db:seed` - Seed database with test data
- `npm run db:studio` - Open database browser

### Development Commands
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run lint` - Run linter

## What Gets Created

After setup, you'll have:

### 🗄️ Database
- **Season 2** with 7 rounds (Sep 2025 - Dec 2025)
- **10 test players** including Magnus Carlsen, Garry Kasparov, etc.
- **Admin user** with credentials below

### 🔐 Admin Access
- **URL**: http://localhost:3000/admin-auth
- **Username**: `admin`
- **Password**: `SchachKreis4Admin2025!`

### 📁 Files
- `.env` - Environment variables (auto-updated)
- `prisma/dev.db` - Your local database files

## Working with the Setup

### Daily Development Workflow

**Option 1: Automated (Recommended)**
```bash
npm run setup:local    # Starts everything
# In new terminal:
npm run dev            # Start Next.js
```

**Option 2: Manual Control**
```bash
# Terminal 1 - Keep running:
npm run db:dev

# Terminal 2:
npm run dev
```

### Resetting Your Database

To start fresh with clean data:

```bash
npm run setup:local    # This automatically resets everything
```

Or manually:
```bash
npm run db:dev:stop
npm run db:dev:remove
npm run db:dev
# Update .env with new connection string
npm run setup:manual
```

## Troubleshooting

### "Node.js 20 or later required"
Update Node.js to version 20+. Check with: `node --version`

### "Connection string not found"
Make sure Prisma dev server is running first:
```bash
npm run db:dev
```
Then copy the `DATABASE_URL` to your `.env` file.

### "Migration failed"
Reset your database:
```bash
npm run db:dev:stop
npm run db:dev:remove
npm run setup:local
```

### "Port already in use"
Stop any existing Prisma dev servers:
```bash
npm run db:dev:stop
# or find the process: lsof -i :51213
```

## Project Structure

```
classical-league/
├── scripts/
│   ├── setup-env.js      # Automated setup script
│   └── local-setup.sh    # Manual setup script
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── seed.ts          # Test data
│   └── migrations/      # Database migrations
├── .env                 # Environment variables
└── LOCAL_SETUP.md       # This guide
```

## For Claude Code Users

When sharing this project with Claude Code:

1. Run the setup: `npm run setup:local`
2. Share the connection string from your terminal output
3. Claude can then update your `.env` file and work with your database

The setup creates a consistent environment that Claude Code can work with immediately.

## Advanced Usage

### Named Database Instances

Create multiple database instances for different features:

```bash
npx prisma dev --name feature-branch
npx prisma dev --name testing
npx prisma dev --name main
```

Each gets its own connection string and data.

### Production-like Testing

To test with production database structure:

```bash
npm run db:migrate:dev    # Apply any new migrations
npm run build            # Test production build
```

---

**Questions?** Check the main project documentation or create an issue in the repository.