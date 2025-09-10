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

    // Create dummy players for testing
    const dummyPlayers = [
      { fullName: 'Magnus Carlsen', email: 'magnus@test.com', nickname: 'World Champion', phone: '+47123456789' },
      { fullName: 'Garry Kasparov', email: 'garry@test.com', nickname: 'The Beast from Baku', phone: '+7987654321' },
      { fullName: 'Bobby Fischer', email: 'bobby@test.com', nickname: 'American Genius', phone: '+1555123456' },
      { fullName: 'Mikhail Tal', email: 'tal@test.com', nickname: 'The Magician from Riga', phone: '+371987654321' },
      { fullName: 'Jose Raul Capablanca', email: 'capa@test.com', nickname: 'The Chess Machine', phone: '+53123456789' },
      { fullName: 'Emanuel Lasker', email: 'lasker@test.com', nickname: 'The Fighting Machine', phone: '+49123456789' },
      { fullName: 'Anatoly Karpov', email: 'karpov@test.com', nickname: 'The Python', phone: '+7123456789' },
      { fullName: 'Vladimir Kramnik', email: 'kramnik@test.com', nickname: 'The Octopus', phone: '+7987123456' },
      { fullName: 'Viswanathan Anand', email: 'anand@test.com', nickname: 'The Lightning Kid', phone: '+91987654321' },
      { fullName: 'Fabiano Caruana', email: 'fabi@test.com', nickname: 'The American Hope', phone: '+1987654321' }
    ]

    console.log('🎭 Creating dummy players...')
    
    for (const player of dummyPlayers) {
      const existingPlayer = await prisma.player.findFirst({
        where: {
          seasonId: season.id,
          email: player.email
        }
      })

      if (!existingPlayer) {
        await prisma.player.create({
          data: {
            seasonId: season.id,
            fullName: player.fullName,
            email: player.email,
            nickname: player.nickname,
            phoneNumber: player.phone,
            rulesAccepted: true,
            isApproved: true, // Auto-approve for testing
            approvedDate: new Date()
          }
        })
        console.log(`   ✅ Created player: ${player.fullName} "${player.nickname}"`)
      }
    }
    
    console.log('🎉 Dummy players created!')
  } else {
    console.log('✅ Season 2 already exists')
    
    // Get existing season for dummy players
    const season = await prisma.season.findUnique({
      where: { seasonNumber: 2 }
    })
    
    if (season) {
      // Create dummy players for testing
      const dummyPlayers = [
        { fullName: 'Magnus Carlsen', email: 'magnus@test.com', nickname: 'World Champion', phone: '+47123456789' },
        { fullName: 'Garry Kasparov', email: 'garry@test.com', nickname: 'The Beast from Baku', phone: '+7987654321' },
        { fullName: 'Bobby Fischer', email: 'bobby@test.com', nickname: 'American Genius', phone: '+1555123456' },
        { fullName: 'Mikhail Tal', email: 'tal@test.com', nickname: 'The Magician from Riga', phone: '+371987654321' },
        { fullName: 'Jose Raul Capablanca', email: 'capa@test.com', nickname: 'The Chess Machine', phone: '+53123456789' },
        { fullName: 'Emanuel Lasker', email: 'lasker@test.com', nickname: 'The Fighting Machine', phone: '+49123456789' },
        { fullName: 'Anatoly Karpov', email: 'karpov@test.com', nickname: 'The Python', phone: '+7123456789' },
        { fullName: 'Vladimir Kramnik', email: 'kramnik@test.com', nickname: 'The Octopus', phone: '+7987123456' },
        { fullName: 'Viswanathan Anand', email: 'anand@test.com', nickname: 'The Lightning Kid', phone: '+91987654321' },
        { fullName: 'Fabiano Caruana', email: 'fabi@test.com', nickname: 'The American Hope', phone: '+1987654321' }
      ]

      console.log('🎭 Creating dummy players...')
      
      for (const player of dummyPlayers) {
        const existingPlayer = await prisma.player.findFirst({
          where: {
            seasonId: season.id,
            email: player.email
          }
        })

        if (!existingPlayer) {
          await prisma.player.create({
            data: {
              seasonId: season.id,
              fullName: player.fullName,
              email: player.email,
              nickname: player.nickname,
              phoneNumber: player.phone,
              rulesAccepted: true,
              isApproved: true, // Auto-approve for testing
              approvedDate: new Date()
            }
          })
          console.log(`   ✅ Created player: ${player.fullName} "${player.nickname}"`)
        } else {
          console.log(`   ⏭️ Player already exists: ${player.fullName}`)
        }
      }
      
      console.log('🎉 Dummy players processed!')
    }
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