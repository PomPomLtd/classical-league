import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentSeason } from '@/lib/season'
import { playerRegistrationSchema } from '@/lib/validations'
import { sendRegistrationSuccessEmail, sendEmailSafe } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input data
    const validationResult = playerRegistrationSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    const { fullName, email, phoneNumber, nickname, lichessRating, rulesAccepted } = validationResult.data

    // Get current active season
    const currentSeason = await getCurrentSeason()
    if (!currentSeason) {
      return NextResponse.json(
        { error: 'No active season found. Please contact the administrator.' },
        { status: 400 }
      )
    }

    // Check for existing player with same email or nickname in current season
    const existingPlayer = await db.player.findFirst({
      where: {
        seasonId: currentSeason.id,
        OR: [
          { email: email },
          { nickname: nickname }
        ]
      }
    })

    if (existingPlayer) {
      const duplicateField = existingPlayer.email === email ? 'email' : 'nickname'
      return NextResponse.json(
        { 
          error: `A player with this ${duplicateField} is already registered for the current season.`
        },
        { status: 409 }
      )
    }

    // Create new player (pending approval)
    const newPlayer = await db.player.create({
      data: {
        seasonId: currentSeason.id,
        fullName,
        email,
        phoneNumber,
        nickname,
        lichessRating: parseInt(lichessRating),
        rulesAccepted,
        isApproved: false // Requires admin approval
      }
    })

    // Send registration success email (non-blocking)
    sendEmailSafe(
      () => sendRegistrationSuccessEmail(email, fullName, nickname),
      'registration success'
    )

    return NextResponse.json(
      { 
        message: 'Registration successful! Your registration is pending admin approval.',
        player: {
          id: newPlayer.id,
          fullName: newPlayer.fullName,
          nickname: newPlayer.nickname,
          email: newPlayer.email
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}