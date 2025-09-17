interface Round {
  id: string
  roundNumber: number
  roundDate: string
  byeDeadline: string
  pgnFilePath?: string
  pgnUpdatedAt?: string
  lichessBroadcastUrl?: string
}

interface RoundCardProps {
  round: Round
  isNotifying: boolean
  onNotifyPairings: (roundId: string, roundNumber: number) => void
  onShowChecklist: (roundId: string, roundNumber: number) => void
}

export default function RoundCard({
  round,
  isNotifying,
  onNotifyPairings,
  onShowChecklist
}: RoundCardProps) {
  const roundDate = new Date(round.roundDate)

  // Calculate the bi-weekly playing period
  // Round date is when pairings are published (Wednesday)
  // Players have exactly 2 weeks to play until the next Wednesday
  const pairingDate = new Date(roundDate) // When pairings are published
  const deadlineDate = new Date(roundDate)
  deadlineDate.setDate(roundDate.getDate() + 14) // 2 weeks later

  const isPast = roundDate < new Date()

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Round {round.roundNumber}
          </h4>
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <div>📅 Playing Period: {pairingDate.toLocaleDateString('de-CH')} - {deadlineDate.toLocaleDateString('de-CH')}</div>
            <div>⏰ Game Deadline & Next Bye Cutoff: {deadlineDate.toLocaleDateString('de-CH')} at 12:00</div>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isPast
                ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            }`}>
              {isPast ? 'Past Round' : 'Upcoming Round'}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => onShowChecklist(round.id, round.roundNumber)}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Checklist
          </button>
          <button
            onClick={() => onNotifyPairings(round.id, round.roundNumber)}
            disabled={isNotifying}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isNotifying ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Notify Players
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}