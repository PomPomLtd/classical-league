import { Aggregates } from '@/app/stats/overview/types'

interface PieceCemeteryProps {
  aggregates: Aggregates
}

export function PieceCemetery({ aggregates }: PieceCemeteryProps) {
  const pieces = [
    { name: 'Pawns', symbol: '♟', count: aggregates.piecesCaptured.pawns, color: 'text-gray-400' },
    { name: 'Knights', symbol: '♞', count: aggregates.piecesCaptured.knights, color: 'text-amber-400' },
    { name: 'Bishops', symbol: '♝', count: aggregates.piecesCaptured.bishops, color: 'text-purple-400' },
    { name: 'Rooks', symbol: '♜', count: aggregates.piecesCaptured.rooks, color: 'text-blue-400' },
    { name: 'Queens', symbol: '♛', count: aggregates.piecesCaptured.queens, color: 'text-red-400' },
  ]

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Graveyard Background */}
      <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-8 md:p-12">

        {/* Fog Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/0 via-gray-700/20 to-gray-900/0 pointer-events-none" />

        {/* Moon */}
        <div className="absolute top-8 right-8 w-24 h-24 bg-yellow-100 rounded-full opacity-30 blur-sm" />
        <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-50 rounded-full opacity-40" />

        {/* Title */}
        <div className="relative text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-100 mb-2">⚰️ The Piece Cemetery</h2>
          <p className="text-gray-400 text-lg">
            {aggregates.piecesCaptured.total} fallen warriors rest here
          </p>
        </div>

        {/* Graveyard Grid */}
        <div className="relative grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          {pieces.map((piece) => (
            <div key={piece.name} className="relative">
              {/* Tombstone */}
              <div className="bg-gradient-to-b from-gray-700 to-gray-800 rounded-t-lg p-6 pb-8 border-2 border-gray-600 shadow-2xl relative group hover:scale-105 transition-transform">
                {/* Tombstone Top Arch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-8 bg-gradient-to-b from-gray-700 to-gray-800 rounded-t-full border-2 border-gray-600 border-b-0" />

                {/* Chess Piece Symbol */}
                <div className={`text-6xl text-center mb-3 ${piece.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                  {piece.symbol}
                </div>

                {/* Count */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{piece.count}</div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider">{piece.name}</div>
                </div>

                {/* Engraving Lines */}
                <div className="absolute bottom-2 left-4 right-4 h-px bg-gray-600 opacity-50" />
              </div>

              {/* Tombstone Base */}
              <div className="h-3 bg-gradient-to-b from-gray-800 to-gray-900 border-x-2 border-b-2 border-gray-600 rounded-b-sm" />

              {/* Ground Grass */}
              <div className="flex justify-center gap-1 mt-1">
                <div className="w-1 h-2 bg-green-900 opacity-50 rounded-full" />
                <div className="w-1 h-3 bg-green-900 opacity-40 rounded-full" />
                <div className="w-1 h-2 bg-green-900 opacity-30 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Memorial Stats */}
        <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-gray-200 mb-4 text-center">Battle Records</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="text-blue-400 text-sm mb-1">En Passant</div>
              <div className="text-2xl font-bold text-white">{aggregates.totalEnPassant}</div>
              <div className="text-xs text-gray-500 mt-1">Rare captures</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="text-red-400 text-sm mb-1">Blunders</div>
              <div className="text-2xl font-bold text-white">{aggregates.totalBlunders}</div>
              <div className="text-xs text-gray-500 mt-1">Fatal mistakes</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="text-orange-400 text-sm mb-1">Mistakes</div>
              <div className="text-2xl font-bold text-white">{aggregates.totalMistakes}</div>
              <div className="text-xs text-gray-500 mt-1">Minor errors</div>
            </div>
          </div>
        </div>

        {/* Epitaph */}
        <div className="relative text-center mt-12 px-4">
          <div className="font-syne-tactile italic text-xl md:text-2xl text-gray-400 leading-relaxed tracking-wide">
            &ldquo;Here lie the pieces that fought bravely
            <br />
            but fell in battle.&rdquo;
          </div>
        </div>
      </div>
    </div>
  )
}
