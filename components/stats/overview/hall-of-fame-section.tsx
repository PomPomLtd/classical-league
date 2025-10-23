import { HallOfFame } from '@/app/stats/overview/types'
import { StatCard } from '../stat-card'
import { PlayerVs, PlayerName } from '../player-name'

interface HallOfFameSectionProps {
  hallOfFame: HallOfFame
}

export function HallOfFameSection({ hallOfFame }: HallOfFameSectionProps) {
  return (
    <StatCard title="🏆 Hall of Fame">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Cleanest Game */}
        {hallOfFame.cleanestGame && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="font-semibold text-green-900 dark:text-green-300 mb-1">💎 Cleanest Game Ever</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={hallOfFame.cleanestGame.white} black={hallOfFame.cleanestGame.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.cleanestGame.round} • Combined ACPL: <strong>{hallOfFame.cleanestGame.combinedACPL.toFixed(1)}</strong>
            </div>
          </div>
        )}

        {/* Wildest Game */}
        {hallOfFame.wildestGame && (
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="font-semibold text-purple-900 dark:text-purple-300 mb-1">🎢 Wildest Game Ever</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={hallOfFame.wildestGame.white} black={hallOfFame.wildestGame.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.wildestGame.round} • Combined ACPL: <strong>{hallOfFame.wildestGame.combinedACPL.toFixed(1)}</strong>
            </div>
          </div>
        )}

        {/* Biggest Blunder */}
        {hallOfFame.biggestBlunder && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg border-2 border-red-400 dark:border-red-600">
            <div className="font-semibold text-red-900 dark:text-red-200 mb-1">💥 Blunder of the Tournament</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerName name={hallOfFame.biggestBlunder.player === 'white' ? hallOfFame.biggestBlunder.white : hallOfFame.biggestBlunder.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.biggestBlunder.round} • Move {hallOfFame.biggestBlunder.moveNumber}. <strong className="font-mono">{hallOfFame.biggestBlunder.move}</strong> • <strong className="text-red-900 dark:text-red-200">{hallOfFame.biggestBlunder.cpLoss} cp</strong>
            </div>
          </div>
        )}

        {/* Most Accurate */}
        {hallOfFame.mostAccurate && (
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border-2 border-yellow-400 dark:border-yellow-600">
            <div className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">🎖️ Best Performance Ever</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerName name={hallOfFame.mostAccurate.player === 'white' ? hallOfFame.mostAccurate.white : hallOfFame.mostAccurate.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.mostAccurate.round} • Accuracy: <strong className="text-yellow-900 dark:text-yellow-200">{hallOfFame.mostAccurate.accuracy}%</strong> • ACPL: <strong>{hallOfFame.mostAccurate.acpl}</strong>
            </div>
          </div>
        )}

        {/* Sportiest Queen */}
        {hallOfFame.sportiestQueen && (
          <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-700">
            <div className="font-semibold text-pink-900 dark:text-pink-300 mb-1">👸 Ultra Marathon Queen</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerName name={hallOfFame.sportiestQueen.color === 'White' ? hallOfFame.sportiestQueen.white : hallOfFame.sportiestQueen.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.sportiestQueen.round} • {hallOfFame.sportiestQueen.distance} squares ({hallOfFame.sportiestQueen.distanceCm} cm, {hallOfFame.sportiestQueen.distanceHumanScaleM}m human scale)
            </div>
          </div>
        )}

        {/* Most Retreats */}
        {hallOfFame.mostRetreats && (
          <div className="p-4 bg-lime-50 dark:bg-lime-900/20 rounded-lg border border-lime-200 dark:border-lime-700">
            <div className="font-semibold text-lime-900 dark:text-lime-300 mb-1">🐔 Chicken Champion</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerName name={hallOfFame.mostRetreats.color === 'White' ? hallOfFame.mostRetreats.white : hallOfFame.mostRetreats.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.mostRetreats.round} • {hallOfFame.mostRetreats.retreats} retreating moves
            </div>
          </div>
        )}

        {/* Longest Game */}
        {hallOfFame.longestGame && (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
            <div className="font-semibold text-indigo-900 dark:text-indigo-300 mb-1">⏱️ Marathon Match</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={hallOfFame.longestGame.white} black={hallOfFame.longestGame.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.longestGame.round} • {hallOfFame.longestGame.moves} moves
            </div>
          </div>
        )}

        {/* Shortest Game */}
        {hallOfFame.shortestGame && (
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
            <div className="font-semibold text-orange-900 dark:text-orange-300 mb-1">⚡ Speed Run</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={hallOfFame.shortestGame.white} black={hallOfFame.shortestGame.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.shortestGame.round} • Only {hallOfFame.shortestGame.moves} moves!
            </div>
          </div>
        )}

        {/* Longest Check Sequence */}
        {hallOfFame.longestCheckSequence && (
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
            <div className="font-semibold text-orange-900 dark:text-orange-300 mb-1">👑 Ultimate King Hunt</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={hallOfFame.longestCheckSequence.white} black={hallOfFame.longestCheckSequence.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.longestCheckSequence.round} • {hallOfFame.longestCheckSequence.length} checks in a row
            </div>
          </div>
        )}

        {/* Longest Capture Spree */}
        {hallOfFame.longestCaptureSpree && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
            <div className="font-semibold text-red-900 dark:text-red-300 mb-1">🔪 Ultimate Capture Spree</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={hallOfFame.longestCaptureSpree.white} black={hallOfFame.longestCaptureSpree.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.longestCaptureSpree.round} • {hallOfFame.longestCaptureSpree.length} consecutive captures
            </div>
          </div>
        )}

        {/* Earliest Castling */}
        {hallOfFame.earliestCastling && (
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="font-semibold text-purple-900 dark:text-purple-300 mb-1">🏁 Speed Castling Record</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerName name={hallOfFame.earliestCastling.winner === 'white' ? hallOfFame.earliestCastling.white : hallOfFame.earliestCastling.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.earliestCastling.round} • Castled on move {hallOfFame.earliestCastling.moves}!
            </div>
          </div>
        )}

        {/* Biggest Comeback */}
        {hallOfFame.biggestComeback && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="font-semibold text-green-900 dark:text-green-300 mb-1">🎯 Epic Comeback</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerName name={hallOfFame.biggestComeback.player === 'white' ? hallOfFame.biggestComeback.white : hallOfFame.biggestComeback.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.biggestComeback.round} • Swing: <strong className="text-green-900 dark:text-green-200">{hallOfFame.biggestComeback.swing} cp</strong>
            </div>
          </div>
        )}

        {/* Most Obscure Opening */}
        {hallOfFame.mostObscureOpening && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="font-semibold text-blue-900 dark:text-blue-300 mb-1">🎩 Ultimate Opening Hipster</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={hallOfFame.mostObscureOpening.white} black={hallOfFame.mostObscureOpening.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.mostObscureOpening.round} • {hallOfFame.mostObscureOpening.eco} {hallOfFame.mostObscureOpening.name}
            </div>
          </div>
        )}

      </div>
    </StatCard>
  )
}
