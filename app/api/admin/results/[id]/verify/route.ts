import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { PGNFileService } from '@/lib/pgn-file-service'

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
      },
      include: {
        round: true
      }
    })

    // Regenerate PGN for broadcast after verification (async, don't wait for completion)
    const pgnService = new PGNFileService()
    pgnService.generateRoundPGN(updatedResult.roundId).catch(error => {
      console.error(`Failed to regenerate PGN for round ${updatedResult.roundId} after verification:`, error)
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