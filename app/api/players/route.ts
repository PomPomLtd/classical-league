import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get current active season
    const currentSeason = await db.season.findFirst({
      where: { isActive: true }
    })

    if (!currentSeason) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 })
    }

    // Fetch only approved players from current season
    const playersData = await db.player.findMany({
      where: {
        seasonId: currentSeason.id,
        isApproved: true,
        isWithdrawn: false
      },
      select: {
        id: true,
        fullName: true,
        nickname: true,
        phoneNumber: true
      },
      orderBy: [
        { fullName: 'asc' }
      ]
    })

    // Format names as "FirstName 'Nickname' LastInitial." with separate parts for styling
    const players = playersData.map(player => {
      const nameParts = player.fullName.trim().split(' ')
      const firstName = nameParts[0]
      const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0).toUpperCase() + '.' : ''
      
      return {
        id: player.id,
        firstName,
        nickname: player.nickname,
        lastInitial,
        fullName: player.fullName, // Keep for search
        phoneNumber: player.phoneNumber
      }
    })

    return NextResponse.json(players)
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
}