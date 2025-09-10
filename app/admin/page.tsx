import { db } from '@/lib/db'
import { getCurrentSeason } from '@/lib/season'

async function getAdminStats() {
  const currentSeason = await getCurrentSeason()
  if (!currentSeason) {
    return {
      pendingPlayers: 0,
      approvedPlayers: 0,
      pendingByes: 0,
      unverifiedResults: 0,
      currentRound: null,
      nextRound: null
    }
  }

  const [
    pendingPlayers,
    approvedPlayers,
    pendingByes,
    unverifiedResults,
    rounds
  ] = await Promise.all([
    db.player.count({
      where: { seasonId: currentSeason.id, isApproved: false, isWithdrawn: false }
    }),
    db.player.count({
      where: { seasonId: currentSeason.id, isApproved: true, isWithdrawn: false }
    }),
    db.byeRequest.count({
      where: { 
        player: { seasonId: currentSeason.id },
        isApproved: null 
      }
    }),
    db.gameResult.count({
      where: { 
        round: { seasonId: currentSeason.id },
        isVerified: false 
      }
    }),
    db.round.findMany({
      where: { seasonId: currentSeason.id },
      orderBy: { roundNumber: 'asc' }
    })
  ])

  const now = new Date()
  const currentRound = rounds.find(round => 
    round.roundDate <= now && round.roundDate >= new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  )
  const nextRound = rounds.find(round => round.roundDate > now)

  return {
    pendingPlayers,
    approvedPlayers,
    pendingByes,
    unverifiedResults,
    currentRound,
    nextRound
  }
}

export default async function AdminDashboard() {
  const stats = await getAdminStats()
  const currentSeason = await getCurrentSeason()

  const statCards = [
    {
      title: 'Pending Players',
      value: stats.pendingPlayers,
      description: 'Awaiting approval',
      color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200',
      href: '/admin/players?filter=pending'
    },
    {
      title: 'Approved Players', 
      value: stats.approvedPlayers,
      description: 'Active in tournament',
      color: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200',
      href: '/admin/players?filter=approved'
    },
    {
      title: 'Pending Byes',
      value: stats.pendingByes,
      description: 'Need approval',
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200',
      href: '/admin/byes?filter=pending'
    },
    {
      title: 'Unverified Results',
      value: stats.unverifiedResults,
      description: 'Need verification',
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200',
      href: '/admin/results?filter=unverified'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Admin Dashboard
          </h1>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span className="mr-2">🏆</span>
              {currentSeason ? `Season ${currentSeason.seasonNumber}` : 'No active season'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <a
            key={stat.title}
            href={stat.href}
            className={`${stat.color} rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer border`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl font-bold">
                  {stat.value}
                </div>
              </div>
              <div className="ml-3 w-0 flex-1">
                <div className="text-sm font-medium">
                  {stat.title}
                </div>
                <div className="text-xs opacity-75">
                  {stat.description}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Current Round Info */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
            Tournament Progress
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {stats.currentRound && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Current Round
                </h4>
                <div className="mt-1">
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    Round {stats.currentRound.roundNumber}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    {stats.currentRound.roundDate.toLocaleDateString('de-CH')}
                  </div>
                </div>
              </div>
            )}
            
            {stats.nextRound && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Next Round
                </h4>
                <div className="mt-1">
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    Round {stats.nextRound.roundNumber}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    {stats.nextRound.roundDate.toLocaleDateString('de-CH')}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Bye deadline: {stats.nextRound.byeDeadline.toLocaleDateString('de-CH')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <a
              href="/admin/players"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="mr-2">👥</span>
              Manage Players
            </a>
            <a
              href="/admin/byes"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="mr-2">⏸️</span>
              Review Byes
            </a>
            <a
              href="/admin/results"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="mr-2">🏆</span>
              Verify Results
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}