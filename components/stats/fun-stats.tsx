import { StatCard } from './stat-card'

interface FunStatsProps {
  funStats?: {
    fastestQueenTrade: {
      moves: number
      gameIndex: number
      white: string
      black: string
    } | null
    slowestQueenTrade: {
      moves: number
      gameIndex: number
      white: string
      black: string
    } | null
    longestCaptureSequence: {
      length: number
      gameIndex: number
      startMove: number
      white: string
      black: string
    } | null
    longestCheckSequence: {
      length: number
      gameIndex: number
      startMove: number
      white: string
      black: string
    } | null
    pawnStorm: {
      count: number
      gameIndex: number
      white: string
      black: string
    } | null
    pieceLoyalty: {
      moves: number
      gameIndex: number
      piece: string
      square: string
      white: string
      black: string
    } | null
    squareTourist: {
      squares: number
      gameIndex: number
      piece: string
      color: string
      startSquare: string
      white: string
      black: string
    } | null
    castlingRace: {
      moves: number
      gameIndex: number
      winner: string
      white: string
      black: string
    } | null
    openingHipster: {
      gameIndex: number
      eco: string
      name: string
      moves: string
      white: string
      black: string
    } | null
    dadbodShuffler: {
      moves: number
      gameIndex: number
      color: string
      white: string
      black: string
    } | null
    sportyQueen: {
      distance: number
      gameIndex: number
      color: string
      white: string
      black: string
    } | null
  }
}

export function FunStats({ funStats }: FunStatsProps) {
  if (!funStats) return null

  return (
    <StatCard title="🎉 Fun Stats">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {funStats.fastestQueenTrade && (
          <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
            <div className="font-semibold text-pink-900 dark:text-pink-300 mb-1">⚡ Fastest Queen Trade</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {funStats.fastestQueenTrade.white} vs {funStats.fastestQueenTrade.black}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Queens traded by move {funStats.fastestQueenTrade.moves}
            </div>
          </div>
        )}

        {funStats.slowestQueenTrade && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="font-semibold text-amber-900 dark:text-amber-300 mb-1">🐌 Slowest Queen Trade</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {funStats.slowestQueenTrade.white} vs {funStats.slowestQueenTrade.black}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Queens kept until move {funStats.slowestQueenTrade.moves}
            </div>
          </div>
        )}

        {funStats.longestCaptureSequence && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="font-semibold text-red-900 dark:text-red-300 mb-1">🔪 Longest Capture Spree</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {funStats.longestCaptureSequence.white} vs {funStats.longestCaptureSequence.black}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.longestCaptureSequence.length} consecutive captures starting move {funStats.longestCaptureSequence.startMove}
            </div>
          </div>
        )}

        {funStats.longestCheckSequence && (
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="font-semibold text-orange-900 dark:text-orange-300 mb-1">👑 Longest King Hunt</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {funStats.longestCheckSequence.white} vs {funStats.longestCheckSequence.black}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.longestCheckSequence.length} checks by one side starting move {funStats.longestCheckSequence.startMove}
            </div>
          </div>
        )}

        {funStats.pawnStorm && (
          <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
            <div className="font-semibold text-cyan-900 dark:text-cyan-300 mb-1">🌪️ Pawn Storm Award</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {funStats.pawnStorm.white} vs {funStats.pawnStorm.black}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.pawnStorm.count} pawn moves in the opening phase
            </div>
          </div>
        )}

        {funStats.pieceLoyalty && (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <div className="font-semibold text-indigo-900 dark:text-indigo-300 mb-1">🏠 Piece Loyalty Award</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {funStats.pieceLoyalty.white} vs {funStats.pieceLoyalty.black}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.pieceLoyalty.piece} stayed on {funStats.pieceLoyalty.square} for {funStats.pieceLoyalty.moves} moves
            </div>
          </div>
        )}

        {funStats.squareTourist && (
          <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
            <div className="font-semibold text-teal-900 dark:text-teal-300 mb-1">✈️ Square Tourist Award</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {funStats.squareTourist.white} vs {funStats.squareTourist.black}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.squareTourist.color}&apos;s {funStats.squareTourist.startSquare} {funStats.squareTourist.piece} visited {funStats.squareTourist.squares} different squares
            </div>
          </div>
        )}

        {funStats.castlingRace && (
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="font-semibold text-purple-900 dark:text-purple-300 mb-1">🏁 Castling Race Winner</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {funStats.castlingRace.white} vs {funStats.castlingRace.black}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.castlingRace.winner === 'white' ? funStats.castlingRace.white : funStats.castlingRace.black} castled first on move {funStats.castlingRace.moves}
            </div>
          </div>
        )}

        {funStats.openingHipster && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="font-semibold text-blue-900 dark:text-blue-300 mb-1">🎩 Opening Hipster</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {funStats.openingHipster.white} vs {funStats.openingHipster.black}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Most obscure opening: {funStats.openingHipster.eco} {funStats.openingHipster.name}
            </div>
          </div>
        )}

        {funStats.dadbodShuffler && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">👑 Dadbod Shuffler</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {funStats.dadbodShuffler.white} vs {funStats.dadbodShuffler.black}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.dadbodShuffler.color} king moved {funStats.dadbodShuffler.moves} times
            </div>
          </div>
        )}

        {funStats.sportyQueen && (
          <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
            <div className="font-semibold text-pink-900 dark:text-pink-300 mb-1">👸 Sporty Queen</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {funStats.sportyQueen.white} vs {funStats.sportyQueen.black}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.sportyQueen.color} queen traveled {funStats.sportyQueen.distance} squares
            </div>
          </div>
        )}
      </div>
    </StatCard>
  )
}
