import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: resultId } = await params

    // Check if result exists
    const result = await db.gameResult.findUnique({
      where: { id: resultId }
    })

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 })
    }

    if (result.isVerified) {
      return NextResponse.json({ error: 'Result is already verified' }, { status: 400 })
    }

    // Verify the result
    const updatedResult = await db.gameResult.update({
      where: { id: resultId },
      data: {
        isVerified: true,
        verifiedDate: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Result verified successfully',
      result: updatedResult
    })
  } catch (error) {
    console.error('Error verifying result:', error)
    return NextResponse.json(
      { error: 'Failed to verify result' },
      { status: 500 }
    )
  }
}