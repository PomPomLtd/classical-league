import { getCurrentRound } from '@/lib/season'

// Force dynamic rendering to avoid build-time database calls
export const dynamic = 'force-dynamic'

export default async function LinksPage() {
  const currentRound = await getCurrentRound()
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Tournament Links
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            External links for pairings, standings, and tournament management
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Current Pairings */}
          <a
            href="https://swisssystem.org/tournament/dd5ba09cff1b4ca0972936c5d01dae58/rounds"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative bg-white dark:bg-gray-800 p-8 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">
                  {currentRound ? `Round ${currentRound.roundNumber} Pairings` : 'Current Round Pairings'}
                  <svg className="inline-block w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {currentRound 
                    ? `Round ${currentRound.roundNumber} matchups (${new Date(currentRound.roundDate).toLocaleDateString('de-CH')})`
                    : 'View current round matchups and board assignments'
                  }
                </p>
              </div>
            </div>
          </a>

          {/* Standings */}
          <a
            href="https://swisssystem.org/tournament/dd5ba09cff1b4ca0972936c5d01dae58/standings"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative bg-white dark:bg-gray-800 p-8 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400">
                  Tournament Standings
                  <svg className="inline-block w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Current tournament standings and crosstable
                </p>
              </div>
            </div>
          </a>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mt-12">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                About External Links
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p>• All pairings and official standings are managed through SwissSystem.org</p>
                <p>• Links will be updated with specific tournament URLs once available</p>
                <p>• Check these links regularly for the latest pairings and results</p>
                <p>• Bookmark the SwissSystem.org tournament page for quick access</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tournament Status */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Current Tournament Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">2</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Season</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">23.9.2025</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Start Date</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">7</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Rounds</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}