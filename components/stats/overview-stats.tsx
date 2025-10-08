interface OverviewStatsProps {
  overview: {
    totalGames: number
    totalMoves: number
    averageGameLength: number
    longestGame: {
      moves: number
      white: string
      black: string
      result: string
    }
    shortestGame: {
      moves: number
      white: string
      black: string
      result: string
    }
  }
}

export function OverviewStats({ overview }: OverviewStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
        <div className="text-3xl font-bold">{overview.totalGames}</div>
        <div className="text-blue-100 mt-1">Games Played</div>
      </div>
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
        <div className="text-3xl font-bold">{overview.totalMoves}</div>
        <div className="text-purple-100 mt-1">Total Moves</div>
      </div>
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow p-6 text-white">
        <div className="text-3xl font-bold">{Math.round(overview.averageGameLength)}</div>
        <div className="text-emerald-100 mt-1">Avg Game Length (moves)</div>
      </div>
      <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg shadow p-6 text-white">
        <div className="text-3xl font-bold">{overview.longestGame.moves}</div>
        <div className="text-rose-100 mt-1">Longest Game (moves)</div>
      </div>
    </div>
  )
}
