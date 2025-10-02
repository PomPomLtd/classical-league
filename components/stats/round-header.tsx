import Link from 'next/link'

interface RoundHeaderProps {
  roundNumber: number
  generatedAt: string
  nextRoundExists: boolean
}

export function RoundHeader({ roundNumber, generatedAt, nextRoundExists }: RoundHeaderProps) {
  return (
    <>
      <div>
        <Link href="/stats" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm mb-2 inline-block">
          ← Back to Statistics
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Round {roundNumber} Statistics
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Generated on {new Date(generatedAt).toLocaleDateString('de-CH')}
            </p>
          </div>

          {/* Round Navigation */}
          <div className="flex items-center space-x-2">
            {roundNumber > 1 && (
              <Link
                href={`/stats/round/${roundNumber - 1}`}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Round {roundNumber - 1}</span>
                <span className="sm:hidden">Rd {roundNumber - 1}</span>
              </Link>
            )}
            {nextRoundExists && (
              <Link
                href={`/stats/round/${roundNumber + 1}`}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="hidden sm:inline">Round {roundNumber + 1}</span>
                <span className="sm:hidden">Rd {roundNumber + 1}</span>
                <svg className="w-4 h-4 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Broadcast Link */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
              Watch the Games
            </h3>
            <div className="mt-2 text-sm text-indigo-700 dark:text-indigo-300">
              <p className="mb-2">View all games from this round on the Lichess broadcast:</p>
              <a
                href="https://lichess.org/broadcast/classical-league-season-2/LVSkiDuJ"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
              >
                View Broadcast on Lichess
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
