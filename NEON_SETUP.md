# Neon Database Configuration Guide

## Important: Connection Pooling vs Direct Connection

Neon provides two connection strings for each database:

1. **Pooled Connection** (ends with `-pooler`): For application runtime
2. **Direct Connection**: For migrations and schema changes

### Your Connection Strings

Based on your setup, you have:

#### Pooled Connection (for application):
```
postgresql://neondb_owner:npg_Jd8j7vAlWQOV@ep-lingering-fire-ag4e3lut-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

#### Direct Connection (for migrations):
```
postgresql://neondb_owner:npg_Jd8j7vAlWQOV@ep-lingering-fire-ag4e3lut.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

**Note**: The direct connection is the same URL but without `-pooler` in the hostname.

## Vercel Environment Variables Setup

Configure these in your Vercel dashboard:

### For Production Environment:

1. **DATABASE_URL** (for Prisma migrations and Prisma Client):
   ```
   postgresql://neondb_owner:npg_Jd8j7vAlWQOV@ep-lingering-fire-ag4e3lut.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
   Use the DIRECT connection (without -pooler) for this.

2. **DATABASE_URL_POOLED** (optional, for high-concurrency scenarios):
   ```
   postgresql://neondb_owner:npg_Jd8j7vAlWQOV@ep-lingering-fire-ag4e3lut-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

### Why Two URLs?

- **Migrations require direct connection**: Prisma Migrate needs a direct connection to apply schema changes
- **Pooled connections are for runtime**: Better for serverless environments with many concurrent connections
- **Prisma Client works with both**: But direct connection is recommended for simplicity

## Prisma Configuration

Your `prisma/schema.prisma` should use the direct connection:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // This should be the direct connection
}
```

## Connection Pooling with Prisma

For serverless environments, Prisma handles connection pooling internally. You don't need to use Neon's pooler URL unless you're experiencing connection limit issues.

If you do need to use the pooler, you can configure it in your Prisma Client:

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.NODE_ENV === 'production' 
        ? process.env.DATABASE_URL  // Direct connection
        : process.env.DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Troubleshooting Neon-Specific Issues

### 1. "Too many connections" Error
**Solution**: Use the pooled connection URL or reduce Prisma connection limit:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add connection limit for serverless
  relationMode = "prisma"
}
```

### 2. "SSL connection required" Error
**Solution**: Ensure `?sslmode=require` is in your connection string

### 3. "Connection timeout" in Vercel
**Solution**: 
- Ensure you're using the correct region (eu-central-1 in your case)
- Consider using Vercel Edge Functions in the same region

### 4. Migration Fails with "Connection pooling error"
**Solution**: Always use the direct connection (without `-pooler`) for migrations

## Neon Dashboard Quick Actions

1. **View connection strings**: Dashboard → Connection Details
2. **Monitor connections**: Dashboard → Monitoring → Connections
3. **Set connection limits**: Settings → Compute → Autoscaling
4. **Create branches**: Branches → Create Branch (for testing migrations)

## Security Note

**IMPORTANT**: The connection string you provided contains credentials. Make sure to:
1. Never commit these credentials to git
2. Rotate the password if it was exposed
3. Use environment variables exclusively
4. Enable IP allowlisting in Neon if possible

To rotate your password in Neon:
1. Go to Settings → Roles
2. Click on your role
3. Reset password
4. Update all environment variables

## Database Branching for Safe Testing

Neon supports database branching, which is perfect for testing migrations:

```bash
# Create a branch for testing (via Neon CLI)
neon branch create --name test-migration

# Test your migration on the branch
DATABASE_URL="branch-connection-string" npm run db:migrate:dev

# If successful, apply to main
DATABASE_URL="main-connection-string" npm run db:migrate:deploy
```

This provides an extra safety layer before production deployments.