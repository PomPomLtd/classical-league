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

    // Get broadcast settings
    const broadcastSettings = await db.adminSettings.findMany({
      where: {
        key: {
          in: ['broadcast_enabled', 'broadcast_base_url', 'broadcast_tournament_template', 'broadcast_round_template']
        }
      }
    })

    const broadcastMap = new Map(broadcastSettings.map(s => [s.key, s.value]))

    const settings = {
      tournamentLink: tournamentSettings.tournamentLink,
      currentSeasonId: activeSeason?.id || '',
      broadcastEnabled: broadcastMap.get('broadcast_enabled') === 'true',
      broadcastBaseUrl: broadcastMap.get('broadcast_base_url') || 'https://classical.schachklub-k4.ch',
      broadcastTournamentTemplate: broadcastMap.get('broadcast_tournament_template') || 'Classical League Season {season}',
      broadcastRoundTemplate: broadcastMap.get('broadcast_round_template') || 'Round {round}'
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

    const { 
      tournamentLink, 
      currentSeasonId, 
      broadcastEnabled, 
      broadcastBaseUrl, 
      broadcastTournamentTemplate, 
      broadcastRoundTemplate 
    } = await request.json()

    // Validate inputs
    if (tournamentLink && !isValidUrl(tournamentLink)) {
      return NextResponse.json({ error: 'Invalid tournament link URL' }, { status: 400 })
    }

    if (broadcastBaseUrl && !isValidUrl(broadcastBaseUrl)) {
      return NextResponse.json({ error: 'Invalid broadcast base URL' }, { status: 400 })
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

    // Update broadcast settings
    const broadcastSettingsData = [
      { key: 'broadcast_enabled', value: broadcastEnabled?.toString() || 'false' },
      { key: 'broadcast_base_url', value: broadcastBaseUrl || 'https://classical.schachklub-k4.ch' },
      { key: 'broadcast_tournament_template', value: broadcastTournamentTemplate || 'Classical League Season {season}' },
      { key: 'broadcast_round_template', value: broadcastRoundTemplate || 'Round {round}' }
    ]

    for (const setting of broadcastSettingsData) {
      await db.adminSettings.upsert({
        where: { key: setting.key },
        update: { 
          value: setting.value,
          updatedAt: new Date()
        },
        create: {
          id: crypto.randomUUID(),
          key: setting.key,
          value: setting.value,
          description: getSettingDescription(setting.key)
        }
      })
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

function getSettingDescription(key: string): string {
  const descriptions: Record<string, string> = {
    'broadcast_enabled': 'Enable/disable Lichess broadcast PGN generation',
    'broadcast_base_url': 'Base URL for PGN file access',
    'broadcast_tournament_template': 'Template for tournament names',
    'broadcast_round_template': 'Template for round names'
  }
  return descriptions[key] || ''
}