import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { db } from '@/lib/db'
import { getTournamentSettings, updateTournamentSettings } from '@/lib/settings'

export async function GET() {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current active season
    const activeSeason = await db.season.findFirst({
      where: { isActive: true }
    })

    // Get tournament settings from database
    const tournamentSettings = await getTournamentSettings()

    const settings = {
      tournamentLink: tournamentSettings.tournamentLink,
      currentSeasonId: activeSeason?.id || ''
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tournamentLink, currentSeasonId } = await request.json()

    // Validate inputs
    if (tournamentLink && !isValidUrl(tournamentLink)) {
      return NextResponse.json({ error: 'Invalid tournament link URL' }, { status: 400 })
    }

    if (!currentSeasonId) {
      return NextResponse.json({ error: 'Current season is required' }, { status: 400 })
    }

    // Verify the season exists
    const season = await db.season.findUnique({
      where: { id: currentSeasonId }
    })

    if (!season) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 })
    }

    // Update tournament settings in database
    const settingsUpdated = await updateTournamentSettings(tournamentLink)
    if (!settingsUpdated) {
      return NextResponse.json({ error: 'Failed to update tournament settings' }, { status: 500 })
    }

    // Update active season - set all to inactive first, then activate the selected one
    await db.season.updateMany({
      data: { isActive: false }
    })

    await db.season.update({
      where: { id: currentSeasonId },
      data: { isActive: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully'
    })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}