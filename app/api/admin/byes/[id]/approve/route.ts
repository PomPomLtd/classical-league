import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { db } from '@/lib/db'

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

    const requestId = params.id

    // Check if bye request exists
    const byeRequest = await db.byeRequest.findUnique({
      where: { id: requestId },
      include: {
        round: true
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

    // Approve the bye request
    const updatedRequest = await db.byeRequest.update({
      where: { id: requestId },
      data: {
        isApproved: true,
        approvedDate: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Bye request approved successfully',
      byeRequest: updatedRequest
    })
  } catch (error) {
    console.error('Error approving bye request:', error)
    return NextResponse.json(
      { error: 'Failed to approve bye request' },
      { status: 500 }
    )
  }
}