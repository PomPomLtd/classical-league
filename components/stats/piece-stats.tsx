import { StatCard } from './stat-card'

interface PieceStatsProps {
  pieces: {
    activity: {
      pawns: number
      knights: number
      bishops: number
      rooks: number
      queens: number
      kings: number
    }
    captured: {
      pawns: number
      knights: number
      bishops: number
      rooks: number
      queens: number
    }
    survivalRate: {
      rooks: number
      queens: number
      bishops: number
      knights: number
    }
  }
}

const PIECE_LABELS: Record<string, string> = {
  pawns: 'Pawn moves',
  knights: 'Knight moves',
  bishops: 'Bishop moves',
  rooks: 'Rook moves',
  queens: 'Queen moves',
  kings: 'King moves'
}

export function PieceStats({ pieces }: PieceStatsProps) {
  return (
    <StatCard title="👑 Piece Activity">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(pieces.activity).map(([piece, moves]) => (
          <div key={piece} className="text-center p-3 bg-gray-50 dark:bg-gray-900/20 rounded">
            <div className="text-xl font-bold text-gray-900 dark:text-white">{moves}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{PIECE_LABELS[piece]}</div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Pieces Captured</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(pieces.captured).map(([piece, count]) => (
            <div key={piece} className="text-center text-sm">
              <div className="font-bold text-gray-900 dark:text-white">{count}</div>
              <div className="text-gray-600 dark:text-gray-400 capitalize">{piece}</div>
            </div>
          ))}
        </div>
      </div>
    </StatCard>
  )
}
