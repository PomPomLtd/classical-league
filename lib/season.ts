import { db } from './db'

export async function getCurrentSeason() {
  return db.season.findFirst({
    where: { isActive: true }
  })
}

export async function createSeason(seasonNumber: number, name: string, startDate: Date) {
  // Generate rounds every 2 weeks starting from start date
  const rounds = []
  const currentDate = new Date(startDate)
  
  for (let i = 1; i <= 7; i++) {
    // Bye deadline is Wednesday noon before the round (3 days before)
    const byeDeadline = new Date(currentDate)
    byeDeadline.setDate(currentDate.getDate() - 3) // 3 days before
    byeDeadline.setHours(12, 0, 0, 0) // Noon
    
    rounds.push({
      roundNumber: i,
      roundDate: new Date(currentDate),
      byeDeadline: byeDeadline
    })
    
    // Add 2 weeks for next round
    currentDate.setDate(currentDate.getDate() + 14)
  }

  // Set all other seasons to inactive
  await db.season.updateMany({
    data: { isActive: false }
  })

  // Create new season with rounds
  return db.season.create({
    data: {
      seasonNumber,
      name,
      startDate,
      endDate: new Date(currentDate), // End date after 7 rounds
      isActive: true,
      rounds: {
        create: rounds
      }
    },
    include: {
      rounds: true
    }
  })
}

export async function getActiveRounds() {
  const season = await getCurrentSeason()
  if (!season) return []

  return db.round.findMany({
    where: { 
      seasonId: season.id,
      roundDate: { gte: new Date() } // Only future/current rounds
    },
    orderBy: { roundNumber: 'asc' }
  })
}