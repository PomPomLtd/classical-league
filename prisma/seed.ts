import { PrismaClient, GameResultEnum } from '@prisma/client'
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

    // Create comprehensive test data
    const approvedPlayers = [
      { fullName: 'Magnus Carlsen', email: 'magnus@test.com', nickname: 'World Champion', phone: '+47123456789', rating: 2839 },
      { fullName: 'Garry Kasparov', email: 'garry@test.com', nickname: 'The Beast from Baku', phone: '+7987654321', rating: 2851 },
      { fullName: 'Bobby Fischer', email: 'bobby@test.com', nickname: 'American Genius', phone: '+1555123456', rating: 2785 },
      { fullName: 'Mikhail Tal', email: 'tal@test.com', nickname: 'The Magician from Riga', phone: '+371987654321', rating: 2690 },
      { fullName: 'Jose Raul Capablanca', email: 'capa@test.com', nickname: 'The Chess Machine', phone: '+53123456789', rating: 2725 },
      { fullName: 'Emanuel Lasker', email: 'lasker@test.com', nickname: 'The Fighting Machine', phone: '+49123456789', rating: 2690 },
      { fullName: 'Anatoly Karpov', email: 'karpov@test.com', nickname: 'The Python', phone: '+7123456789', rating: 2780 },
      { fullName: 'Vladimir Kramnik', email: 'kramnik@test.com', nickname: 'The Octopus', phone: '+7987123456', rating: 2800 },
      { fullName: 'Viswanathan Anand', email: 'anand@test.com', nickname: 'The Lightning Kid', phone: '+91987654321', rating: 2785 },
      { fullName: 'Fabiano Caruana', email: 'fabi@test.com', nickname: 'The American Hope', phone: '+1987654321', rating: 2820 }
    ]

    // Pending players (not yet approved)
    const pendingPlayers = [
      { fullName: 'Ding Liren', email: 'ding@test.com', nickname: 'The Steady Strategist', phone: '+86123456789', rating: 2810 },
      { fullName: 'Ian Nepomniachtchi', email: 'nepo@test.com', nickname: 'Nepo', phone: '+7654321987', rating: 2795 },
      { fullName: 'Hikaru Nakamura', email: 'hikaru@test.com', nickname: 'Speed Demon', phone: '+1456789123', rating: 2780 }
    ]

    // Withdrawn players
    const withdrawnPlayers = [
      { fullName: 'Alexander Alekhine', email: 'alekhine@test.com', nickname: 'The Tactical Genius', phone: '+33123456789', rating: 2700 }
    ]

    console.log('🎭 Creating test players...')

    // Create approved players
    const createdApprovedPlayers = []
    for (const player of approvedPlayers) {
      const existingPlayer = await prisma.player.findFirst({
        where: {
          seasonId: season.id,
          email: player.email
        }
      })

      if (!existingPlayer) {
        const newPlayer = await prisma.player.create({
          data: {
            seasonId: season.id,
            fullName: player.fullName,
            email: player.email,
            nickname: player.nickname,
            phoneNumber: player.phone,
            lichessRating: player.rating,
            rulesAccepted: true,
            isApproved: true,
            approvedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
          }
        })
        createdApprovedPlayers.push(newPlayer)
        console.log(`   ✅ Created approved player: ${player.fullName} "${player.nickname}"`)
      } else {
        createdApprovedPlayers.push(existingPlayer)
        console.log(`   ⏭️ Approved player already exists: ${player.fullName}`)
      }
    }

    // Create pending players (awaiting approval)
    const createdPendingPlayers = []
    for (const player of pendingPlayers) {
      const existingPlayer = await prisma.player.findFirst({
        where: {
          seasonId: season.id,
          email: player.email
        }
      })

      if (!existingPlayer) {
        const newPlayer = await prisma.player.create({
          data: {
            seasonId: season.id,
            fullName: player.fullName,
            email: player.email,
            nickname: player.nickname,
            phoneNumber: player.phone,
            lichessRating: player.rating,
            rulesAccepted: true,
            isApproved: false, // Pending approval
            approvedDate: null
          }
        })
        createdPendingPlayers.push(newPlayer)
        console.log(`   ⏳ Created pending player: ${player.fullName} "${player.nickname}"`)
      } else {
        console.log(`   ⏭️ Pending player already exists: ${player.fullName}`)
      }
    }

    // Create withdrawn players
    for (const player of withdrawnPlayers) {
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
            lichessRating: player.rating,
            rulesAccepted: true,
            isApproved: true,
            approvedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
            isWithdrawn: true,
            withdrawalDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Withdrew 7 days ago
          }
        })
        console.log(`   🚪 Created withdrawn player: ${player.fullName} "${player.nickname}"`)
      } else {
        console.log(`   ⏭️ Withdrawn player already exists: ${player.fullName}`)
      }
    }

    console.log('🎉 Test players created!')

    // Create sample game results for Round 1 (past round)
    console.log('♟️ Creating sample game results...')
    const round1 = season.rounds.find(r => r.roundNumber === 1)
    if (round1 && createdApprovedPlayers.length >= 6) {
      const sampleResults = [
        {
          boardNumber: 1,
          result: GameResultEnum.WHITE_WIN,
          whitePlayerId: createdApprovedPlayers[0].id, // Magnus
          blackPlayerId: createdApprovedPlayers[1].id, // Garry
          winningPlayerId: createdApprovedPlayers[0].id,
          pgn: `[Event "Classical League Season 2 Round 1"]
[Site "Zürich, Switzerland"]
[Date "2025.09.23"]
[Round "1"]
[White "Magnus Carlsen"]
[Black "Garry Kasparov"]
[Result "1-0"]
[WhiteElo "2839"]
[BlackElo "2851"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. Nbd2 Bb7 12. Bc2 Re8 13. Nf1 Bf8 14. Ng3 g6 15. a4 c5 16. d5 c4 17. Bg5 Qc7 18. Qd2 h6 19. Be3 Nc5 20. Nh2 a5 21. Nhf1 Bd7 22. Ne2 Rab8 23. f4 exf4 24. Nxf4 Ne8 25. Rf1 Bc8 26. Ng3 Nd7 27. e5 dxe5 28. Nge4 Nf6 29. Nxf6+ Nxf6 30. Ne6 Bxe6 31. dxe6 Qc6 32. Rad1 Red8 33. Qf2 Rxd1 34. Rxd1 Qe8 35. Qf5 Qe7 36. Rd7 Qe8 37. Bb1 Rc8 38. Qf3 Rc7 39. Rxc7 Qxe6 40. Rc8 Qe1+ 41. Kh2 Qe5+ 42. Kg1 Qe1+ 43. Kf2 Qe5 44. Rxf8+ Kh7 45. Rf7+ Kg8 46. Rb7 Qc5 47. Qf5 Qd6 48. Be4 Nxe4 49. Qf7+ Kh8 50. Qf8+ Kh7 51. Qf5+ Kg8 52. Qf7+ Kh8 53. Rb8+ Kg7 54. Qf8+ Kh7 55. Rb7+ Kg6 56. Qf7+ Kh6 57. Rb6 1-0`,
          isVerified: true,
          verifiedDate: new Date()
        },
        {
          boardNumber: 2,
          result: GameResultEnum.DRAW,
          whitePlayerId: createdApprovedPlayers[2].id, // Bobby
          blackPlayerId: createdApprovedPlayers[3].id, // Tal
          pgn: `[Event "Classical League Season 2 Round 1"]
[Site "Zürich, Switzerland"]
[Date "2025.09.23"]
[Round "1"]
[White "Bobby Fischer"]
[Black "Mikhail Tal"]
[Result "1/2-1/2"]
[WhiteElo "2785"]
[BlackElo "2690"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Be7 4. d3 d6 5. O-O Nf6 6. Re1 O-O 7. c3 a6 8. Bb3 b5 9. Bc2 Bb7 10. Nbd2 Re8 11. Nf1 Bf8 12. Ng3 g6 13. h3 Bg7 14. Be3 Qd7 15. Qd2 h6 16. Rad1 Rad8 17. d4 exd4 18. cxd4 Na5 19. e5 dxe5 20. dxe5 Qxd2 21. Rxd2 Rxd2 22. Bxd2 Nc4 23. exf6 Nxd2 24. fxg7 Nxf3+ 25. gxf3 Kxg7 26. Re7 Rc8 27. Rxc7 Rxc7 28. Bxg6 Rc1+ 29. Kh2 fxg6 30. f4 Rc2 31. f5 gxf5 32. Nxf5+ Kf6 33. Nxh6 Rxb2 34. Ng4+ Ke6 35. Ne3 a5 36. h4 b4 37. h5 Bd5 38. Nxd5 Kxd5 39. h6 Rb1 40. h7 Rh1+ 41. Kg3 Rxh7 42. Kf4 b3 43. axb3 a4 44. bxa4 Ra7 45. Ke3 Rxa4 46. f3 Ra3+ 47. Kf2 Ke5 48. Kg2 Kf4 49. Kh2 Kxf3 50. Kg1 Kg3 51. Kf1 Ra1+ 52. Ke2 Ra2+ 53. Kd3 Kf3 54. Kc3 Ke3 55. Kb3 Ra1 56. Kc2 Kf2 57. Kd2 Ra2+ 58. Kd1 Kf1 1/2-1/2`,
          isVerified: true,
          verifiedDate: new Date()
        },
        {
          boardNumber: 3,
          result: GameResultEnum.BLACK_WIN,
          whitePlayerId: createdApprovedPlayers[4].id, // Capablanca
          blackPlayerId: createdApprovedPlayers[5].id, // Lasker
          winningPlayerId: createdApprovedPlayers[5].id,
          pgn: `[Event "Classical League Season 2 Round 1"]
[Site "Zürich, Switzerland"]
[Date "2025.09.23"]
[Round "1"]
[White "Jose Raul Capablanca"]
[Black "Emanuel Lasker"]
[Result "0-1"]
[WhiteElo "2725"]
[BlackElo "2690"]

1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 h6 7. Bh4 b6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5 11. Rc1 Be6 12. Qa4 c5 13. Qa3 Rc8 14. Bb5 a6 15. dxc5 bxc5 16. Bd3 Nd7 17. O-O Qb4 18. Qxb4 cxb4 19. Rc7 Rxc7 20. Rc1 Rfc8 21. Rxc7 Rxc7 22. Kf1 f6 23. Ke2 Kf7 24. Kd2 Nc5 25. Bc2 Ke7 26. f3 Kd6 27. e4 dxe4 28. fxe4 Bg4 29. h3 Be6 30. Ke3 Nd7 31. Kf4 Ne5 32. Nxe5 fxe5+ 33. Kg3 Rc3+ 34. Kf2 a5 35. Bd1 Bd7 36. Ke2 Rc1 37. Bb3 Rc3 38. Bd1 Rb3 39. Bc2 Rxb2 40. Kd3 Ra2 41. Kc4 Rxa2 42. Bb3 Ra1 43. Kxb4 a4 44. Bc4 a3 45. Ka4 Bc6+ 46. Kb3 Ra2 47. Bb5 Bxb5 48. Kxa2 Bd3 49. Kb3 Bxe4 50. Kxa3 Kc5 51. Kb3 Bd5+ 52. Ka4 Kc4 53. Ka5 Kc3 54. Ka4 Kd2 55. Kb4 Ke2 56. Kc3 Kf2 57. Kd2 Kg2 58. Ke2 Kxg2 59. Kd2 Kxh3 60. Ke2 Kg2 61. Kd2 h5 62. Ke2 h4 63. Kd2 h3 64. Ke2 h2 65. Kd2 h1=Q 66. Ke2 Qh2+ 67. Kd1 Kf1 68. Kc1 Qc2# 0-1`,
          isVerified: true,
          verifiedDate: new Date()
        },
        {
          boardNumber: 4,
          result: GameResultEnum.WHITE_WIN_FF,
          whitePlayerId: createdApprovedPlayers[6].id, // Karpov
          blackPlayerId: createdApprovedPlayers[7].id, // Kramnik
          winningPlayerId: createdApprovedPlayers[6].id,
          forfeitReason: 'Black player did not show up for the game',
          isVerified: true,
          verifiedDate: new Date()
        }
      ]

      for (const result of sampleResults) {
        const existingResult = await prisma.gameResult.findUnique({
          where: {
            roundId_boardNumber: {
              roundId: round1.id,
              boardNumber: result.boardNumber
            }
          }
        })

        if (!existingResult) {
          await prisma.gameResult.create({
            data: {
              roundId: round1.id,
              boardNumber: result.boardNumber,
              result: result.result,
              whitePlayerId: result.whitePlayerId,
              blackPlayerId: result.blackPlayerId,
              winningPlayerId: result.winningPlayerId,
              pgn: result.pgn || null,
              forfeitReason: result.forfeitReason || null,
              submittedById: result.whitePlayerId, // Assume white submitted
              submittedDate: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000), // Random date within last 5 days
              isVerified: result.isVerified,
              verifiedDate: result.verifiedDate
            }
          })
          console.log(`   ♟️ Created game result: Board ${result.boardNumber} - ${result.result}`)
        }
      }
    }

    // Create some unverified results for Round 2
    console.log('📋 Creating unverified game results...')
    const round2 = season.rounds.find(r => r.roundNumber === 2)
    if (round2 && createdApprovedPlayers.length >= 4) {
      const unverifiedResults = [
        {
          boardNumber: 1,
          result: GameResultEnum.DRAW,
          winningPlayerId: null,
          pgn: `[Event "Classical League Season 2 Round 2"]
[Site "Zürich, Switzerland"]
[Date "2025.10.07"]
[Round "2"]
[White "Player"]
[Black "Player"]
[Result "1/2-1/2"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 1/2-1/2`
        },
        {
          boardNumber: 2,
          result: GameResultEnum.WHITE_WIN,
          winningPlayerId: createdApprovedPlayers[0].id,
          pgn: `[Event "Classical League Season 2 Round 2"]
[Site "Zürich, Switzerland"]
[Date "2025.10.07"]
[Round "2"]
[White "Player"]
[Black "Player"]
[Result "1-0"]

1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 h6 7. Bh4 b6 8. cxd5 Nxd5 1-0`
        }
      ]

      for (const result of unverifiedResults) {
        const existingResult = await prisma.gameResult.findUnique({
          where: {
            roundId_boardNumber: {
              roundId: round2.id,
              boardNumber: result.boardNumber
            }
          }
        })

        if (!existingResult) {
          await prisma.gameResult.create({
            data: {
              roundId: round2.id,
              boardNumber: result.boardNumber,
              result: result.result,
              winningPlayerId: result.winningPlayerId,
              pgn: result.pgn,
              submittedById: createdApprovedPlayers[Math.floor(Math.random() * createdApprovedPlayers.length)].id,
              submittedDate: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000), // Random date within last 2 days
              isVerified: false // Not yet verified
            }
          })
          console.log(`   📋 Created unverified result: Board ${result.boardNumber} - ${result.result}`)
        }
      }
    }

    // Create bye requests
    console.log('🚫 Creating bye requests...')
    const round3 = season.rounds.find(r => r.roundNumber === 3)
    const round4 = season.rounds.find(r => r.roundNumber === 4)

    if (round3 && createdApprovedPlayers.length >= 3) {
      // Approved bye request for Round 3
      const existingApprovedBye = await prisma.byeRequest.findFirst({
        where: {
          playerId: createdApprovedPlayers[8].id, // Anand
          roundId: round3.id
        }
      })

      if (!existingApprovedBye) {
        await prisma.byeRequest.create({
          data: {
            playerId: createdApprovedPlayers[8].id, // Anand
            roundId: round3.id,
            requestedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            isApproved: true,
            approvedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
            adminNotes: 'Business travel - approved'
          }
        })
        console.log('   ✅ Created approved bye request (Round 3)')
      }

      // Pending bye request for Round 4
      if (round4) {
        const existingPendingBye = await prisma.byeRequest.findFirst({
          where: {
            playerId: createdApprovedPlayers[9].id, // Caruana
            roundId: round4.id
          }
        })

        if (!existingPendingBye) {
          await prisma.byeRequest.create({
            data: {
              playerId: createdApprovedPlayers[9].id, // Caruana
              roundId: round4.id,
              requestedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
              isApproved: null, // Pending approval
              adminNotes: null
            }
          })
          console.log('   ⏳ Created pending bye request (Round 4)')
        }

        // Another pending bye request
        const existingPendingBye2 = await prisma.byeRequest.findFirst({
          where: {
            playerId: createdApprovedPlayers[2].id, // Bobby Fischer
            roundId: round4.id
          }
        })

        if (!existingPendingBye2) {
          await prisma.byeRequest.create({
            data: {
              playerId: createdApprovedPlayers[2].id, // Bobby Fischer
              roundId: round4.id,
              requestedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
              isApproved: null, // Pending approval
              adminNotes: null
            }
          })
          console.log('   ⏳ Created second pending bye request (Round 4)')
        }
      }

      // Rejected bye request for Round 3
      const existingRejectedBye = await prisma.byeRequest.findFirst({
        where: {
          playerId: createdApprovedPlayers[7].id, // Kramnik
          roundId: round3.id
        }
      })

      if (!existingRejectedBye) {
        await prisma.byeRequest.create({
          data: {
            playerId: createdApprovedPlayers[7].id, // Kramnik
            roundId: round3.id,
            requestedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
            isApproved: false,
            approvedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            adminNotes: 'Request submitted too late - deadline missed'
          }
        })
        console.log('   ❌ Created rejected bye request (Round 3)')
      }
    }

    console.log('🎉 Sample data created!')
  } else {
    console.log('✅ Season 2 already exists - skipping comprehensive seed data')
    console.log('💡 To refresh test data, reset the database and run seed again')
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