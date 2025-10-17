import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function POST(
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

    // Check if player exists and is not already withdrawn
    const player = await db.player.findUnique({
      where: { id: playerId }
    })

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    if (player.isWithdrawn) {
      return NextResponse.json({ error: 'Player is already withdrawn' }, { status: 400 })
    }

    // Withdraw the player
    const updatedPlayer = await db.player.update({
      where: { id: playerId },
      data: {
        isWithdrawn: true,
        withdrawalDate: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      player: updatedPlayer
    })
  } catch (error) {
    console.error('Error withdrawing player:', error)
    return NextResponse.json(
      { error: 'Failed to withdraw player' },
      { status: 500 }
    )
  }
}