import { PlayerVs } from './player-name'

interface AwardsSectionProps {
  awards: {
    bloodbath: {
      white: string
      black: string
      captures: number
    }
    pacifist: {
      white: string
      black: string
      captures: number
    }
    speedDemon: {
      white: string
      black: string
      moves: number
      winner: string
    } | null
    endgameWizard: {
      white: string
      black: string
      endgameMoves: number
    }
    openingSprinter: {
      white: string
      black: string
      openingMoves: number
    } | null
  }
}

export function AwardsSection({ awards }: AwardsSectionProps) {
  return (
    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 dark:from-yellow-900 dark:to-orange-900 rounded-lg shadow-xl p-8 text-white">
      <h2 className="text-2xl font-bold mb-6">🏆 Round Awards</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Awards */}
        <div>
          <div className="text-lg font-semibold mb-2">🩸 Bloodbath Award</div>
          <div className="text-yellow-100 dark:text-yellow-200">
            <PlayerVs white={awards.bloodbath.white} black={awards.bloodbath.black} />
          </div>
          <div className="text-sm text-yellow-200 dark:text-yellow-300 mt-1">{awards.bloodbath.captures} captures!</div>
        </div>

        <div>
          <div className="text-lg font-semibold mb-2">🕊️ Pacifist Award</div>
          <div className="text-yellow-100 dark:text-yellow-200">
            <PlayerVs white={awards.pacifist.white} black={awards.pacifist.black} />
          </div>
          <div className="text-sm text-yellow-200 dark:text-yellow-300 mt-1">{awards.pacifist.captures} captures</div>
        </div>

        {awards.speedDemon && (
          <div>
            <div className="text-lg font-semibold mb-2">⚡ Speed Demon</div>
            <div className="text-yellow-100 dark:text-yellow-200">
              <PlayerVs white={awards.speedDemon.white} black={awards.speedDemon.black} />
            </div>
            <div className="text-sm text-yellow-200 dark:text-yellow-300 mt-1">Mate in {awards.speedDemon.moves} moves</div>
          </div>
        )}

        <div>
          <div className="text-lg font-semibold mb-2">🧙 Endgame Wizard</div>
          <div className="text-yellow-100 dark:text-yellow-200">
            <PlayerVs white={awards.endgameWizard.white} black={awards.endgameWizard.black} />
          </div>
          <div className="text-sm text-yellow-200 dark:text-yellow-300 mt-1">{awards.endgameWizard.endgameMoves} endgame moves!</div>
        </div>
      </div>
    </div>
  )
}
