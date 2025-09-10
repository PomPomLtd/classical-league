import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { db } from '@/lib/db'
import { sendPlayerApprovalEmail, sendEmailSafe } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const playerId = params.id

    // Check if player exists and is not already approved
    const player = await db.player.findUnique({
      where: { id: playerId }
    })

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    if (player.isApproved) {
      return NextResponse.json({ error: 'Player is already approved' }, { status: 400 })
    }

    if (player.isWithdrawn) {
      return NextResponse.json({ error: 'Cannot approve withdrawn player' }, { status: 400 })
    }

    // Approve the player
    const updatedPlayer = await db.player.update({
      where: { id: playerId },
      data: {
        isApproved: true,
        approvedDate: new Date()
      }
    })

    // Send player approval email (non-blocking)
    sendEmailSafe(
      () => sendPlayerApprovalEmail(
        player.email,
        player.fullName,
        player.nickname
      ),
      'player approval'
    )

    return NextResponse.json({
      success: true,
      player: updatedPlayer
    })
  } catch (error) {
    console.error('Error approving player:', error)
    return NextResponse.json(
      { error: 'Failed to approve player' },
      { status: 500 }
    )
  }
}