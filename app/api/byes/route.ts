import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { playerId, roundIds } = await request.json()

    if (!playerId || !roundIds || !Array.isArray(roundIds) || roundIds.length === 0) {
      return NextResponse.json(
        { error: 'Player ID and round IDs are required' },
        { status: 400 }
      )
    }

    // Verify player exists and is approved
    const player = await db.player.findUnique({
      where: { id: playerId }
    })

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    if (!player.isApproved || player.isWithdrawn) {
      return NextResponse.json(
        { error: 'Player must be approved and not withdrawn to request byes' },
        { status: 400 }
      )
    }

    // Verify all rounds exist and deadlines haven't passed
    const rounds = await db.round.findMany({
      where: {
        id: { in: roundIds }
      }
    })

    if (rounds.length !== roundIds.length) {
      return NextResponse.json(
        { error: 'One or more rounds not found' },
        { status: 404 }
      )
    }

    const now = new Date()
    const expiredRounds = rounds.filter(round => now > round.byeDeadline)
    
    if (expiredRounds.length > 0) {
      return NextResponse.json(
        { error: `Deadline has passed for round(s): ${expiredRounds.map(r => r.roundNumber).join(', ')}` },
        { status: 400 }
      )
    }

    // Check for existing requests
    const existingRequests = await db.byeRequest.findMany({
      where: {
        playerId: playerId,
        roundId: { in: roundIds }
      }
    })

    if (existingRequests.length > 0) {
      const existingRoundNumbers = await db.round.findMany({
        where: {
          id: { in: existingRequests.map(req => req.roundId) }
        },
        select: { roundNumber: true }
      })
      
      return NextResponse.json(
        { error: `Bye request already exists for round(s): ${existingRoundNumbers.map(r => r.roundNumber).join(', ')}` },
        { status: 400 }
      )
    }

    // Create bye requests
    const byeRequests = await db.byeRequest.createMany({
      data: roundIds.map((roundId: string) => ({
        playerId: playerId,
        roundId: roundId,
        requestedDate: now
      }))
    })

    return NextResponse.json({
      success: true,
      message: `${byeRequests.count} bye request(s) submitted successfully`,
      count: byeRequests.count
    })

  } catch (error) {
    console.error('Error creating bye requests:', error)
    return NextResponse.json(
      { error: 'Failed to submit bye requests' },
      { status: 500 }
    )
  }
}