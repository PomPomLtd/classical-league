import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { sendByeApprovedEmail, sendEmailSafe } from '@/lib/email'

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

    const { id: requestId } = await params

    // Check if bye request exists
    const byeRequest = await db.byeRequest.findUnique({
      where: { id: requestId },
      include: {
        round: true,
        player: true
      }
    })

    if (!byeRequest) {
      return NextResponse.json({ error: 'Bye request not found' }, { status: 404 })
    }

    if (byeRequest.isApproved !== null) {
      return NextResponse.json({ 
        error: `Bye request is already ${byeRequest.isApproved ? 'approved' : 'rejected'}` 
      }, { status: 400 })
    }

    // Check if this is a withdrawal request (no round)
    const isWithdrawal = !byeRequest.round

    if (isWithdrawal) {
      // For withdrawal requests, mark the player as withdrawn and approve the request
      await db.$transaction([
        db.player.update({
          where: { id: byeRequest.playerId },
          data: {
            isWithdrawn: true,
            withdrawalDate: new Date()
          }
        }),
        db.byeRequest.update({
          where: { id: requestId },
          data: {
            isApproved: true,
            approvedDate: new Date()
          }
        })
      ])

      // TODO: Send withdrawal approval email if needed
      
    } else {
      // Regular bye request approval
      await db.byeRequest.update({
        where: { id: requestId },
        data: {
          isApproved: true,
          approvedDate: new Date()
        }
      })

      // Send bye approval email (non-blocking)
      if (byeRequest.round) {
        const round = byeRequest.round
        sendEmailSafe(
          () => sendByeApprovedEmail(
            byeRequest.player.email,
            byeRequest.player.fullName,
            round.roundNumber,
            round.roundDate
          ),
          'bye approval'
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: isWithdrawal ? 'Tournament withdrawal approved successfully' : 'Bye request approved successfully'
    })
  } catch (error) {
    console.error('Error approving bye request:', error)
    return NextResponse.json(
      { error: 'Failed to approve bye request' },
      { status: 500 }
    )
  }
}