import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/lib/auth-config'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // For initial setup, we'll allow this without auth check
    // Remove this comment and uncomment auth check after initial setup
    
    // const session = await getServerSession(authOptions)
    // if (!session || !session.user || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Create tables using individual statements for PostgreSQL
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "settings" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "tournamentLink" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "seasons" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "seasonNumber" INTEGER UNIQUE NOT NULL,
        "name" TEXT NOT NULL,
        "startDate" TIMESTAMP NOT NULL,
        "endDate" TIMESTAMP NOT NULL,
        "isActive" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "players" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "seasonId" TEXT NOT NULL REFERENCES "seasons"("id") ON DELETE CASCADE,
        "fullName" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "nickname" TEXT NOT NULL,
        "phoneNumber" TEXT NOT NULL,
        "lichessRating" INTEGER DEFAULT 1500,
        "registrationDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "rulesAccepted" BOOLEAN DEFAULT true,
        "isApproved" BOOLEAN DEFAULT false,
        "approvedDate" TIMESTAMP,
        "isWithdrawn" BOOLEAN DEFAULT false,
        "withdrawalDate" TIMESTAMP,
        UNIQUE("seasonId", "email"),
        UNIQUE("seasonId", "nickname")
      )
    `)

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "rounds" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "seasonId" TEXT NOT NULL REFERENCES "seasons"("id") ON DELETE CASCADE,
        "roundNumber" INTEGER NOT NULL,
        "roundDate" TIMESTAMP NOT NULL,
        "byeDeadline" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("seasonId", "roundNumber")
      )
    `)

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "bye_requests" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "playerId" TEXT NOT NULL REFERENCES "players"("id") ON DELETE CASCADE,
        "roundId" TEXT NOT NULL REFERENCES "rounds"("id") ON DELETE CASCADE,
        "requestedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "isApproved" BOOLEAN,
        "approvedDate" TIMESTAMP,
        "adminNotes" TEXT,
        UNIQUE("playerId", "roundId")
      )
    `)

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "game_results" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "roundId" TEXT NOT NULL REFERENCES "rounds"("id") ON DELETE CASCADE,
        "boardNumber" INTEGER NOT NULL,
        "result" TEXT NOT NULL,
        "pgn" TEXT NOT NULL,
        "submittedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "submittedById" TEXT REFERENCES "players"("id"),
        "isVerified" BOOLEAN DEFAULT false,
        "verifiedDate" TIMESTAMP,
        "adminNotes" TEXT,
        "whitePlayerId" TEXT REFERENCES "players"("id"),
        "blackPlayerId" TEXT REFERENCES "players"("id"),
        "winningPlayerId" TEXT REFERENCES "players"("id"),
        UNIQUE("roundId", "boardNumber")
      )
    `)

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "admins" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "username" TEXT UNIQUE NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "lastLogin" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Now create Season 2 with rounds
    const existingSeason = await db.season.findUnique({
      where: { seasonNumber: 2 }
    })

    if (!existingSeason) {
      const startDate = new Date('2025-09-23')
      const season = await db.season.create({
        data: {
          seasonNumber: 2,
          name: 'Season 2 - 2025',
          startDate: startDate,
          endDate: new Date('2025-12-15'),
          isActive: true,
          rounds: {
            create: Array.from({ length: 7 }, (_, i) => {
              const roundDate = new Date(startDate)
              roundDate.setDate(startDate.getDate() + (i * 14))
              
              const byeDeadline = new Date(roundDate)
              byeDeadline.setDate(roundDate.getDate() - 4)
              byeDeadline.setHours(12, 0, 0, 0)

              return {
                roundNumber: i + 1,
                roundDate: roundDate,
                byeDeadline: byeDeadline
              }
            })
          }
        },
        include: {
          rounds: true
        }
      })

      return NextResponse.json({ 
        status: 'success',
        message: 'Database schema created and Season 2 initialized',
        season: season,
        rounds: season.rounds.length
      })
    }

    return NextResponse.json({ 
      status: 'success',
      message: 'Database schema created, Season 2 already exists',
      season: existingSeason
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Migration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}