/**
 * Formats a player's name for display in Swiss system format
 * Example: Magnus "The King" C.
 *
 * @param fullName - The player's full name
 * @param nickname - The player's chess nickname
 * @returns Formatted name string
 */
export function formatPlayerName(fullName: string, nickname: string): string {
  const nameParts = fullName.split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts[nameParts.length - 1]
  const lastInitial = lastName ? lastName[0].toUpperCase() : ''
  return `${firstName} «${nickname}» ${lastInitial}.`
}

/**
 * Formats player names for PGN header
 * Uses the same format as formatPlayerName
 */
export function formatPlayerNameForPGN(fullName: string, nickname: string): string {
  return formatPlayerName(fullName, nickname)
}