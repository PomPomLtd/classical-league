/**
 * PlayerName Component
 *
 * Formats player names by styling nicknames (text within « ») in italic.
 * Example: "Boris «Out of Nowhere» G." → Boris <i>«Out of Nowhere»</i> G.
 */

interface PlayerNameProps {
  name: string
  className?: string
}

/**
 * Parse player name and return styled JSX with nickname in italics
 */
export function PlayerName({ name, className = '' }: PlayerNameProps) {
  // Regular expression to match text within « »
  const nicknameRegex = /(«[^»]+»)/g

  // Split the name by nicknames, keeping the nicknames in the result
  const parts = name.split(nicknameRegex)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part is a nickname (wrapped in « »)
        if (part.startsWith('«') && part.endsWith('»')) {
          return (
            <span key={index} className="font-syne-tactile italic">
              {part}
            </span>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </span>
  )
}

/**
 * Helper function for displaying "Player1 vs Player2" with styled nicknames
 */
interface PlayerVsProps {
  white: string
  black: string
  className?: string
}

export function PlayerVs({ white, black, className = '' }: PlayerVsProps) {
  return (
    <span className={className}>
      <PlayerName name={white} /> vs <PlayerName name={black} />
    </span>
  )
}
