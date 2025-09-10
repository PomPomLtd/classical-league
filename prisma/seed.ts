import { PrismaClient } from '@prisma/client'
import { createSeason } from '../lib/season'
import { createInitialAdmin } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create initial admin user
  await createInitialAdmin()

  // Create Season 2 with rounds starting September 23, 2025
  const startDate = new Date('2025-09-23')
  
  // Check if Season 2 already exists
  const existingSeason = await prisma.season.findUnique({
    where: { seasonNumber: 2 }
  })

  if (!existingSeason) {
    const season = await createSeason(2, 'Season 2 - 2025', startDate)
    console.log(`✅ Created Season 2 with ${season.rounds.length} rounds`)
    
    // Print round dates for verification
    season.rounds.forEach((round, index) => {
      console.log(`   Round ${round.roundNumber}: ${round.roundDate.toDateString()} (bye deadline: ${round.byeDeadline.toDateString()})`)
    })
  } else {
    console.log('✅ Season 2 already exists')
  }

  console.log('🎉 Seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })