import { AwardFrequencyData } from '@/app/stats/overview/types'
import { StatCard } from '../stat-card'

interface AwardFrequencySectionProps {
  awardFrequency: AwardFrequencyData
  totalRounds: number
}

export function AwardFrequencySection({ awardFrequency, totalRounds }: AwardFrequencySectionProps) {
  return (
    <StatCard title="📊 Award Frequency (Stat Stats)">
      <div className="space-y-6">

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {awardFrequency.mostCommon && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <div className="font-semibold text-green-900 dark:text-green-300 mb-1">🏆 Most Common Award</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {awardFrequency.mostCommon.displayName}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Appeared in {awardFrequency.mostCommon.appearances}/{totalRounds} rounds ({awardFrequency.mostCommon.percentage}%)
              </div>
            </div>
          )}

          {awardFrequency.leastCommon && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="font-semibold text-blue-900 dark:text-blue-300 mb-1">💎 Rarest Award</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {awardFrequency.leastCommon.displayName}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Only appeared in {awardFrequency.leastCommon.appearances}/{totalRounds} rounds ({awardFrequency.leastCommon.percentage}%)
              </div>
            </div>
          )}
        </div>

        {/* Full Frequency Table */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">All Awards</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Award</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Appearances</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Frequency</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Bar</th>
                </tr>
              </thead>
              <tbody>
                {awardFrequency.sortedByFrequency.map((award, index) => (
                  <tr
                    key={award.key}
                    className={`border-b border-gray-100 dark:border-gray-800 ${
                      award.appearances === 0 ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-gray-900 dark:text-white">
                      {award.displayName}
                    </td>
                    <td className="py-2 px-3 text-center text-gray-700 dark:text-gray-300">
                      {award.appearances}/{totalRounds}
                    </td>
                    <td className="py-2 px-3 text-center font-semibold text-gray-900 dark:text-white">
                      {award.percentage}%
                    </td>
                    <td className="py-2 px-3">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            index === 0
                              ? 'bg-green-500'
                              : award.appearances === 0
                              ? 'bg-gray-400'
                              : 'bg-indigo-500'
                          }`}
                          style={{ width: `${award.percentage}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
          <p className="font-semibold mb-1">💡 About Award Frequency</p>
          <p className="text-blue-800 dark:text-blue-300">
            Some awards appear in every round (like Fastest Queen Trade), while others are rare depending on game circumstances.
            This helps identify which situations are most common in tournament play.
          </p>
        </div>
      </div>
    </StatCard>
  )
}
