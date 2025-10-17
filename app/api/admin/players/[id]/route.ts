import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { playerRegistrationSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: playerId } = await params

    // Fetch player by ID
    const player = await db.player.findUnique({
      where: { id: playerId },
      include: {
        season: {
          select: {
            name: true,
            seasonNumber: true
          }
        }
      }
    })

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    return NextResponse.json(player)
  } catch (error) {
    console.error('Error fetching player:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: playerId } = await params
    const body = await request.json()

    // Validate input data (excluding rulesAccepted for updates)
    const updateData = {
      fullName: body.fullName,
      email: body.email,
      phoneNumber: body.phoneNumber,
      nickname: body.nickname,
      lichessRating: body.lichessRating.toString(), // Convert to string for validation
      rulesAccepted: true // Always true for existing players
    }
    
    const validationResult = playerRegistrationSchema.safeParse(updateData)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input data' }, 
        { status: 400 }
      )
    }

    const { fullName, email, phoneNumber, nickname, lichessRating } = validationResult.data

    // Convert lichessRating back to number for database storage
    const ratingAsNumber = parseInt(lichessRating)

    // Check if player exists
    const existingPlayer = await db.player.findUnique({
      where: { id: playerId },
      include: { season: true }
    })

    if (!existingPlayer) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Check for email uniqueness within the same season (excluding current player)
    const emailConflict = await db.player.findFirst({
      where: {
        seasonId: existingPlayer.seasonId,
        email: email,
        id: { not: playerId }
      }
    })

    if (emailConflict) {
      return NextResponse.json(
        { error: 'Email already registered for this season' },
        { status: 409 }
      )
    }

    // Check for nickname uniqueness within the same season (excluding current player)
    const nicknameConflict = await db.player.findFirst({
      where: {
        seasonId: existingPlayer.seasonId,
        nickname: nickname,
        id: { not: playerId }
      }
    })

    if (nicknameConflict) {
      return NextResponse.json(
        { error: 'Nickname already taken for this season' },
        { status: 409 }
      )
    }

    // Update player
    const updatedPlayer = await db.player.update({
      where: { id: playerId },
      data: {
        fullName,
        email,
        phoneNumber,
        nickname,
        lichessRating: ratingAsNumber
      },
      include: {
        season: {
          select: {
            name: true,
            seasonNumber: true
          }
        }
      }
    })

    return NextResponse.json(updatedPlayer)
  } catch (error) {
    console.error('Error updating player:', error)
    return NextResponse.json(
      { error: 'Failed to update player' },
      { status: 500 }
    )
  }
}