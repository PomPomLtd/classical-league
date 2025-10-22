import { StatCard } from './stat-card'
import { PlayerVs, PlayerName } from './player-name'

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
    edgeLord: {
      moves: number
      gameIndex: number
      color: string
      white: string
      black: string
    } | null
    rookLift: {
      moveNumber: number
      gameIndex: number
      color: string
      rook: string
      square: string
      white: string
      black: string
    } | null
    centerStage: {
      moves: number
      gameIndex: number
      piece: string
      startSquare: string
      color: string
      white: string
      black: string
    } | null
    darkLord: {
      captures: number
      gameIndex: number
      color: string
      white: string
      black: string
    } | null
    chickenAward: {
      retreats: number
      gameIndex: number
      color: string
      white: string
      black: string
    } | null
    homebody?: {
      white: string
      black: string
      player: string
      playerName: string
      piecesInEnemy: number
      description: string
    }
    lateBloomer?: {
      white: string
      black: string
      player: string
      playerName: string
      moveNumber: number
      description: string
    }
    quickDraw?: {
      white: string
      black: string
      player: string
      playerName: string
      moveNumber: number
      description: string
    }
    crosshairs?: {
      white: string
      black: string
      square: string
      attackers: number
      whiteAttackers: number
      blackAttackers: number
      moveNumber: number
      move: string
      description: string
    }
    longestTension?: {
      white: string
      black: string
      moves: number
      squares: string
      startMove: number
      endMove: number
      description: string
    }
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
              <PlayerVs white={funStats.fastestQueenTrade.white} black={funStats.fastestQueenTrade.black} />
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
              <PlayerVs white={funStats.slowestQueenTrade.white} black={funStats.slowestQueenTrade.black} />
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
              <PlayerVs white={funStats.longestCaptureSequence.white} black={funStats.longestCaptureSequence.black} />
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
              <PlayerVs white={funStats.longestCheckSequence.white} black={funStats.longestCheckSequence.black} />
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
              <PlayerVs white={funStats.pawnStorm.white} black={funStats.pawnStorm.black} />
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
              <PlayerVs white={funStats.pieceLoyalty.white} black={funStats.pieceLoyalty.black} />
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
              <PlayerVs white={funStats.squareTourist.white} black={funStats.squareTourist.black} />
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
              <PlayerVs white={funStats.castlingRace.white} black={funStats.castlingRace.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              <PlayerName name={funStats.castlingRace.winner === 'white' ? funStats.castlingRace.white : funStats.castlingRace.black} /> castled first on move {funStats.castlingRace.moves}
            </div>
          </div>
        )}

        {funStats.openingHipster && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="font-semibold text-blue-900 dark:text-blue-300 mb-1">🎩 Opening Hipster</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.openingHipster.white} black={funStats.openingHipster.black} />
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
              <PlayerVs white={funStats.dadbodShuffler.white} black={funStats.dadbodShuffler.black} />
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
              <PlayerVs white={funStats.sportyQueen.white} black={funStats.sportyQueen.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.sportyQueen.color} queen traveled {Math.round(funStats.sportyQueen.distance)} squares (~{(funStats.sportyQueen.distance * 0.82 * 5.5).toFixed(0)} cm, or {(funStats.sportyQueen.distance * 0.82 * 5.5 * 18.54 / 100).toFixed(0)}m at human scale)
            </div>
          </div>
        )}

        {funStats.edgeLord && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
            <div className="font-semibold text-slate-900 dark:text-slate-300 mb-1">📐 Professional Edger</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.edgeLord.white} black={funStats.edgeLord.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.edgeLord.color} made {funStats.edgeLord.moves} moves on edge files (a/h)
            </div>
          </div>
        )}

        {funStats.rookLift && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="font-semibold text-emerald-900 dark:text-emerald-300 mb-1">🚀 Do You Even Rook Lift Bro</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.rookLift.white} black={funStats.rookLift.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.rookLift.rook} activated on move {funStats.rookLift.moveNumber}
            </div>
          </div>
        )}

        {funStats.centerStage && (
          <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
            <div className="font-semibold text-violet-900 dark:text-violet-300 mb-1">⭐ Center Stage</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.centerStage.white} black={funStats.centerStage.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.centerStage.piece} dominated the center with {funStats.centerStage.moves} moves on d4/d5/e4/e5
            </div>
          </div>
        )}

        {funStats.darkLord && (
          <div className="p-4 bg-gray-800 dark:bg-gray-950 rounded-lg border border-gray-700 dark:border-gray-800">
            <div className="font-semibold text-gray-100 dark:text-gray-200 mb-1">🌑 Dark Mode Enthusiast</div>
            <div className="text-sm text-gray-200 dark:text-gray-300">
              <PlayerVs white={funStats.darkLord.white} black={funStats.darkLord.black} />
            </div>
            <div className="text-xs text-gray-300 dark:text-gray-400 mt-1">
              {funStats.darkLord.color} captured {funStats.darkLord.captures} pieces on dark squares
            </div>
          </div>
        )}

        {funStats.chickenAward && (
          <div className="p-4 bg-lime-50 dark:bg-lime-900/20 rounded-lg">
            <div className="font-semibold text-lime-900 dark:text-lime-300 mb-1">🐔 Chicken Award</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.chickenAward.white} black={funStats.chickenAward.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.chickenAward.color} made {funStats.chickenAward.retreats} retreating moves
            </div>
          </div>
        )}

        {funStats.homebody && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="font-semibold text-blue-900 dark:text-blue-300 mb-1">🏠 Homeboy</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.homebody.white} black={funStats.homebody.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              <PlayerName name={funStats.homebody.playerName} /> only crossed {funStats.homebody.piecesInEnemy} piece(s) into opponent&apos;s half
            </div>
          </div>
        )}

        {funStats.lateBloomer && (
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="font-semibold text-purple-900 dark:text-purple-300 mb-1">🐢 Late Bloomer</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.lateBloomer.white} black={funStats.lateBloomer.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              <PlayerName name={funStats.lateBloomer.playerName} /> waited until move {Math.floor((funStats.lateBloomer.moveNumber + 1) / 2)} to cross into opponent&apos;s half
            </div>
          </div>
        )}

        {funStats.quickDraw && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="font-semibold text-green-900 dark:text-green-300 mb-1">🔫 Fastest Gun</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.quickDraw.white} black={funStats.quickDraw.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              <PlayerName name={funStats.quickDraw.playerName} /> crossed into opponent&apos;s half on move {Math.floor((funStats.quickDraw.moveNumber + 1) / 2)}
            </div>
          </div>
        )}

        {funStats.crosshairs && (
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="font-semibold text-orange-900 dark:text-orange-300 mb-1">🎯 Crosshairs</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.crosshairs.white} black={funStats.crosshairs.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.crosshairs.square} attacked by {funStats.crosshairs.attackers} pieces
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {Math.floor((funStats.crosshairs.moveNumber + 1) / 2)}{funStats.crosshairs.moveNumber % 2 === 1 ? '.' : '...'} {funStats.crosshairs.move}
            </div>
          </div>
        )}

        {funStats.longestTension && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="font-semibold text-red-900 dark:text-red-300 mb-1">💢 Hypertension Award</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.longestTension.white} black={funStats.longestTension.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.longestTension.squares} faced off for {funStats.longestTension.moves} moves
            </div>
          </div>
        )}
      </div>
    </StatCard>
  )
}
