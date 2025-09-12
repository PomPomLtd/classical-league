import { db } from './db'

interface TournamentSettings {
  tournamentLink: string | null
}

export async function getTournamentSettings(): Promise<TournamentSettings> {
  try {
    // Get the first (and should be only) settings record
    const settings = await db.settings.findFirst()
    
    // Normalize the link by removing trailing slash
    const link = settings?.tournamentLink?.replace(/\/$/, '') || null
    
    return {
      tournamentLink: link
    }
  } catch (error) {
    console.error('Error fetching tournament settings:', error)
    return {
      tournamentLink: null
    }
  }
}

export async function updateTournamentSettings(tournamentLink: string | null): Promise<boolean> {
  try {
    // Normalize the tournament link by removing trailing slash
    const normalizedLink = tournamentLink?.replace(/\/$/, '') || null
    
    // Check if settings exist
    const existingSettings = await db.settings.findFirst()
    
    if (existingSettings) {
      // Update existing settings
      await db.settings.update({
        where: { id: existingSettings.id },
        data: { tournamentLink: normalizedLink }
      })
    } else {
      // Create new settings record
      await db.settings.create({
        data: { tournamentLink: normalizedLink }
      })
    }
    
    return true
  } catch (error) {
    console.error('Error updating tournament settings:', error)
    return false
  }
}