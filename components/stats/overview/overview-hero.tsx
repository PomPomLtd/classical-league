import { Aggregates } from '@/app/stats/overview/types'

interface OverviewHeroProps {
  aggregates: Aggregates
  roundsIncluded: number[]
  seasonNumber: number
}

export function OverviewHero({ aggregates, roundsIncluded, seasonNumber }: OverviewHeroProps) {
  return (
    <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg shadow-xl p-8 text-white">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Season {seasonNumber} Overview</h2>
        <p className="text-purple-100 mt-2">
          Rounds {roundsIncluded[0]}-{roundsIncluded[roundsIncluded.length - 1]} • {roundsIncluded.length} rounds analyzed
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="text-center">
          <div className="text-4xl font-bold">{aggregates.totalGames}</div>
          <div className="text-purple-100 mt-2">Games Played</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold">{aggregates.totalMoves.toLocaleString()}</div>
          <div className="text-purple-100 mt-2">Total Moves</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold">{aggregates.averageGameLength}</div>
          <div className="text-purple-100 mt-2">Avg Game Length</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold">{aggregates.totalBlunders + aggregates.totalMistakes}</div>
          <div className="text-purple-100 mt-2">Blunders & Mistakes</div>
        </div>
      </div>

    </div>
  )
}
