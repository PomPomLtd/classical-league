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

    const { id: requestId } = await params

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

    // Reject the bye request
    const updatedRequest = await db.byeRequest.update({
      where: { id: requestId },
      data: {
        isApproved: false,
        approvedDate: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Bye request rejected successfully',
      byeRequest: updatedRequest
    })
  } catch (error) {
    console.error('Error rejecting bye request:', error)
    return NextResponse.json(
      { error: 'Failed to reject bye request' },
      { status: 500 }
    )
  }
}