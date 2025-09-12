# Database Migration Guide

This document provides comprehensive guidance for managing database migrations in the Classical League project using Prisma, Vercel, and Neon.

## Table of Contents
- [Overview](#overview)
- [Environment Setup](#environment-setup)
- [Development Workflow](#development-workflow)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

We use Prisma Migrate for database schema management with:
- **Local Development**: PostgreSQL with shadow database
- **Preview/Staging**: Separate Neon database for preview deployments
- **Production**: Neon serverless PostgreSQL

### Key Principles
1. **Never run `migrate dev` in production** - Use `migrate deploy` only
2. **Always test migrations locally first** - Use shadow database for safety
3. **Commit migrations to version control** - Include the `migrations` folder
4. **Deploy via Vercel** - Automated deployments on push to main
5. **Keep migration lock file** - Ensures provider consistency

## Environment Setup

### 1. Local Development Setup

Create a `.env` file based on `.env.example`:

```bash
# Copy example file
cp .env.example .env

# Edit with your local PostgreSQL credentials
DATABASE_URL="postgresql://user:password@localhost:5432/classical_league_dev"
SHADOW_DATABASE_URL="postgresql://user:password@localhost:5432/classical_league_shadow"
```

**Important**: The shadow database is crucial for safe migration development. Prisma uses it to:
- Test migrations without affecting your main dev database
- Detect schema drift
- Generate down migrations for rollback scenarios

### 2. Vercel Environment Variables

Configure in Vercel Dashboard (Settings → Environment Variables):

#### Production Environment
- `DATABASE_URL`: Your production Neon database URL
- `NEXTAUTH_SECRET`: Strong production secret
- `ADMIN_USERNAME`: Production admin username
- `ADMIN_PASSWORD`: Strong production password
- `POSTMARK_API_KEY`: Production email API key

#### Preview Environment
- `DATABASE_URL`: Separate Neon database for previews (recommended)
- Same auth and email variables as production

**Tip**: Use different databases for preview and production to prevent schema conflicts during PR reviews.


## Development Workflow

### Creating New Migrations

#### Step 1: Modify Schema
Edit `prisma/schema.prisma` with your changes:

```prisma
model NewFeature {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  // ... your fields
}
```

#### Step 2: Create Migration
```bash
# Create and apply migration locally
npm run db:migrate:dev

# You'll be prompted for a migration name
# Use descriptive names like: add_user_preferences, create_notifications_table
```

This command:
1. Creates a new migration file in `prisma/migrations/`
2. Applies it to your local database
3. Regenerates Prisma Client

#### Step 3: Test Locally
```bash
# Verify migration status
npx prisma migrate status

# Test your application
npm run dev

# Open Prisma Studio to inspect data
npm run db:studio
```

#### Step 4: Commit Changes
```bash
# Add all migration files
git add prisma/migrations prisma/schema.prisma

# Commit with descriptive message
git commit -m "Add user preferences table with theme settings"

# Push to feature branch
git push origin feature/user-preferences
```

### Quick Development Commands

```bash
# Create new migration
npm run db:migrate:dev

# Push schema changes without migration (prototype only!)
npm run db:push

# Open database GUI
npm run db:studio

# Seed database with test data
npm run db:seed

# Reset database (CAUTION: drops all data)
npx prisma migrate reset
```

## Production Deployment

### Automatic Deployment via Vercel

Migrations deploy automatically when you push to `main` branch:
1. Vercel detects the push and triggers a build
2. The `vercel-build` script runs `prisma migrate deploy`
3. Migrations are applied before the Next.js build

### Manual Deployment (Emergency Only)

If automatic deployment fails:

```bash
# 1. Set production database URL
export DATABASE_URL="your-production-neon-url"

# 2. Deploy pending migrations
npm run db:migrate:deploy

# 3. Verify status
npx prisma migrate status
```

### Vercel Build Process

The `vercel-build` script in `package.json` handles:
1. `prisma migrate deploy` - Applies pending migrations
2. `next build --turbopack` - Builds the application

This ensures migrations run before the app builds, preventing schema mismatches.

## Troubleshooting

### Common Issues and Solutions

#### 1. "Database schema is not up to date"
**Cause**: Pending migrations not applied
**Solution**:
```bash
# Check migration status
npx prisma migrate status

# Apply pending migrations
npm run db:migrate:deploy
```

#### 2. "Migration already applied"
**Cause**: Migration history mismatch
**Solution**:
```bash
# Mark migration as applied (use exact migration name)
npx prisma migrate resolve --applied "20240101000000_migration_name"
```

#### 3. "Shadow database error" (Development)
**Cause**: Shadow database not configured or inaccessible
**Solution**:
```bash
# Create shadow database
createdb classical_league_shadow

# Or update .env with correct shadow DB URL
SHADOW_DATABASE_URL="postgresql://..."
```

#### 4. "P3009: migrate found failed migrations"
**Cause**: Previous migration failed
**Solution**:
```bash
# Check which migration failed
npx prisma migrate status

# Fix the issue, then mark as rolled back
npx prisma migrate resolve --rolled-back "20240101000000_failed_migration"

# Re-apply the migration
npm run db:migrate:deploy
```

#### 5. Build Fails on Vercel
**Cause**: Missing environment variables or migration issues
**Solution**:
1. Check Vercel logs for specific error
2. Ensure DATABASE_URL is set in Vercel environment
3. Verify migrations work locally first
4. Check that `prisma` is in dependencies (not devDependencies)

### Migration Rollback Strategy

While Prisma doesn't have built-in rollback, here's how to handle it:

#### Option 1: Create Compensating Migration
```bash
# Create a new migration that undoes the changes
npm run db:migrate:dev
# Name it: rollback_feature_x
```

#### Option 2: Reset to Previous State (Development Only!)
```bash
# WARNING: This drops all data!
npx prisma migrate reset
```

#### Option 3: Manual Database Restoration
1. Restore database from backup (Neon provides point-in-time recovery)
2. Mark migrations as rolled back in Prisma
3. Remove migration files from codebase

## Best Practices

### Do's ✅

1. **Always use shadow database in development**
   - Prevents accidental data loss
   - Tests migrations safely

2. **Name migrations descriptively**
   - Good: `add_user_authentication`, `create_audit_logs`
   - Bad: `update`, `fix`, `change`

3. **Review migration SQL before applying**
   ```bash
   # Check the generated SQL
   cat prisma/migrations/*/migration.sql
   ```

4. **Test migrations with data**
   - Migrations should work with existing data
   - Consider data migrations separately

5. **Keep migrations small and focused**
   - One logical change per migration
   - Easier to debug and rollback

6. **Use transactions for data migrations**
   ```sql
   -- In migration.sql
   BEGIN;
   UPDATE users SET status = 'active' WHERE status IS NULL;
   COMMIT;
   ```

### Don'ts ❌

1. **Never edit existing migrations**
   - Create new migrations to fix issues
   - Editing breaks migration history

2. **Never use `db push` in production**
   - It bypasses migration history
   - Use only for rapid prototyping

3. **Never delete migration files**
   - Even if rolled back
   - They're part of your schema history

4. **Avoid breaking changes without strategy**
   - Plan for zero-downtime deployments
   - Use expand-contract pattern for column changes

5. **Don't run migrations manually in production**
   - Let Vercel handle it automatically
   - Manual runs risk human error

### Zero-Downtime Migration Patterns

#### Adding a Column
```prisma
// Safe: Add nullable column first
model User {
  newField String? // Nullable initially
}

// Later migration: Add default/make required
model User {
  newField String @default("value")
}
```

#### Renaming a Column (Expand-Contract)
```prisma
// Step 1: Add new column
model User {
  oldName String
  newName String?
}

// Step 2: Copy data (in application code)
// Step 3: Switch reads to new column
// Step 4: Switch writes to new column
// Step 5: Remove old column in final migration
```

#### Changing Column Type
```prisma
// Create new column with new type
// Migrate data
// Drop old column
```

## Migration Checklist

Before creating a migration:
- [ ] Schema changes are backward compatible
- [ ] Migration works with existing data
- [ ] Shadow database is configured (dev)
- [ ] Migration has descriptive name

Before deploying to production:
- [ ] Migration tested locally
- [ ] Migration applied to preview/staging
- [ ] Backup strategy in place
- [ ] Rollback plan prepared
- [ ] Team notified of schema changes

After deployment:
- [ ] Verify migration status
- [ ] Check application functionality
- [ ] Monitor error logs
- [ ] Document any issues

## Quick Reference

### Essential Commands
```bash
# Development
npm run db:migrate:dev        # Create new migration
npm run db:studio             # Open database GUI
npm run db:seed               # Seed with test data

# Production
npm run db:migrate:deploy     # Deploy pending migrations
npx prisma migrate status     # Check migration status

# Utilities
npx prisma format            # Format schema file
npx prisma validate          # Validate schema syntax
npx prisma db pull           # Introspect existing database
```

### Environment Variables
```bash
# Required
DATABASE_URL                 # Main database connection

# Development only
SHADOW_DATABASE_URL          # Shadow database for safe migrations

# Vercel/Production
NODE_ENV="production"        # Set environment type
```

### File Structure
```
prisma/
├── schema.prisma           # Database schema
├── migrations/            # Migration history (commit to git!)
│   ├── migration_lock.toml # Provider lock file
│   └── 20240101_init/     # Individual migrations
│       └── migration.sql
└── seed.ts               # Database seeding script
```

## Getting Help

1. **Prisma Documentation**: https://www.prisma.io/docs
2. **Neon Documentation**: https://neon.com/docs
3. **Vercel Documentation**: https://vercel.com/docs

For project-specific issues, check:
- Migration files in `prisma/migrations/`
- Vercel deployment logs
- Database logs in Neon dashboard

Remember: When in doubt, test in development first!