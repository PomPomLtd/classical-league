import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmailSafe } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { playerId } = await request.json()

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      )
    }

    // Verify player exists and is not already withdrawn
    const player = await db.player.findUnique({
      where: { id: playerId }
    })

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    if (player.isWithdrawn) {
      return NextResponse.json(
        { error: 'Player has already withdrawn from the tournament' },
        { status: 400 }
      )
    }

    if (!player.isApproved) {
      return NextResponse.json(
        { error: 'Only approved players can withdraw from the tournament' },
        { status: 400 }
      )
    }

    // Check if there's already a pending withdrawal request
    const existingWithdrawal = await db.byeRequest.findFirst({
      where: {
        playerId: playerId,
        roundId: null,
        isApproved: null // Pending approval
      }
    })

    if (existingWithdrawal) {
      return NextResponse.json(
        { error: 'Withdrawal request has already been submitted and is pending approval' },
        { status: 400 }
      )
    }

    // Create a special bye request for withdrawal (roundId = undefined)
    await db.byeRequest.create({
      data: {
        playerId: playerId,
        // roundId is omitted for withdrawal requests
        requestedDate: new Date(),
        isApproved: null, // Pending approval
        adminNotes: 'Tournament withdrawal request'
      }
    })

    // Send admin notification for withdrawal (non-blocking)
    sendEmailSafe(
      () => sendAdminWithdrawalNotification(
        player.fullName,
        player.nickname,
        player.email
      ),
      'admin withdrawal notification'
    )

    return NextResponse.json({
      success: true,
      message: 'Tournament withdrawal request submitted successfully. It will be reviewed by the tournament organizers.'
    })

  } catch (error) {
    console.error('Error processing withdrawal request:', error)
    return NextResponse.json(
      { error: 'Failed to submit withdrawal request' },
      { status: 500 }
    )
  }
}

// Admin notification email for withdrawal
async function sendAdminWithdrawalNotification(
  playerName: string,
  nickname: string,
  email: string
): Promise<boolean> {
  const { sendEmail } = await import('@/lib/email')
  
  const subject = 'Player Withdrawal - K4 Classical League'
  const textBody = `A player has withdrawn from the tournament.

Player Details:
- Name: ${playerName}
- Nickname: "${nickname}"
- Email: ${email}
- Withdrawal Date: ${new Date().toLocaleDateString('de-CH')}

The player has been marked as withdrawn in the system and will no longer appear in active player lists.

Please review the withdrawal in the admin panel:
https://classical.schachklub-k4.ch/admin/players

Best regards,
K4 Classical League System`

  return await sendEmail({ 
    to: 'classical@schachklub-k4.ch', 
    subject, 
    textBody 
  })
}