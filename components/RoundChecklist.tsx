'use client'

import { useState, useEffect, useCallback } from 'react'

interface RoundChecklistProps {
  roundId: string
  roundNumber: number
  onClose?: () => void
}

interface ChecklistData {
  round: {
    id: string
    roundNumber: number
    roundDate: string
    byeDeadline: string
  }
  nextRound: {
    id: string
    roundNumber: number
    roundDate: string
    byeDeadline: string
  } | null
  playerStats: {
    activePlayers: number
    newRegistrations: number
    recentWithdrawals: number
  }
  gameStats: {
    submittedResults: number
    verifiedResults: number
    pendingVerification: number
    expectedGames: number
    completionPercentage: number
  }
  byeRequests: {
    approved: Array<{
      id: string
      playerName: string
      fullName: string
      requestedDate: string
      approvedDate?: string
    }>
    pending: Array<{
      id: string
      playerName: string
      fullName: string
      requestedDate: string
    }>
    rejected: Array<{
      id: string
      playerName: string
      fullName: string
      requestedDate: string
      adminNotes?: string
    }>
  }
}

export default function RoundChecklist({ roundId, roundNumber, onClose }: RoundChecklistProps) {
  const [data, setData] = useState<ChecklistData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChecklistData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/rounds/${roundId}/checklist`)

      if (!response.ok) {
        throw new Error('Failed to fetch checklist data')
      }

      const checklistData = await response.json()
      setData(checklistData)
      setError(null)
    } catch (err) {
      console.error('Error fetching checklist data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load checklist data')
    } finally {
      setLoading(false)
    }
  }, [roundId])

  useEffect(() => {
    fetchChecklistData()
  }, [fetchChecklistData])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500 dark:text-gray-400">Loading checklist...</div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <div className="text-red-600 dark:text-red-400 mb-4">{error || 'Failed to load data'}</div>
          <button
            onClick={fetchChecklistData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const ChecklistItem = ({
    label,
    value,
    status,
    details
  }: {
    label: string
    value: string | number
    status: 'complete' | 'warning' | 'pending' | 'info'
    details?: string
  }) => {
    const statusColors = {
      complete: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
      warning: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
      pending: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
      info: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
    }

    const statusDots = {
      complete: 'bg-green-500',
      warning: 'bg-yellow-500',
      pending: 'bg-orange-500',
      info: 'bg-blue-500'
    }

    return (
      <div className="flex items-center justify-between py-2 px-3 rounded-md bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${statusDots[status]}`}></div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white text-sm">{label}</div>
            {details && (
              <div className="text-xs text-gray-500 dark:text-gray-400">{details}</div>
            )}
          </div>
        </div>
        <div className={`font-semibold text-sm px-2 py-1 rounded ${statusColors[status]}`}>
          {value}
        </div>
      </div>
    )
  }

  const isRoundComplete = data.gameStats.completionPercentage >= 100
  const hasUnverifiedResults = data.gameStats.pendingVerification > 0
  const hasPendingByes = data.byeRequests.pending.length > 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Round {roundNumber} Checklist
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Tournament administration status
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Current Round Status */}
        <section>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
            Current Round Status
          </h4>
          <div className="space-y-2">
            <ChecklistItem
              label="Game Results Submitted"
              value={`${data.gameStats.submittedResults}/${data.gameStats.expectedGames}`}
              status={data.gameStats.submittedResults >= data.gameStats.expectedGames ? 'complete' : 'pending'}
              details={`${data.gameStats.completionPercentage}% complete`}
            />
            <ChecklistItem
              label="Results Verified"
              value={`${data.gameStats.verifiedResults}/${data.gameStats.submittedResults}`}
              status={hasUnverifiedResults ? 'warning' : 'complete'}
              details={hasUnverifiedResults ? `${data.gameStats.pendingVerification} need verification` : 'All results verified'}
            />
            <ChecklistItem
              label="Round Completion"
              value={`${data.gameStats.completionPercentage}%`}
              status={isRoundComplete ? 'complete' : 'pending'}
              details={isRoundComplete ? 'Ready for next round' : 'Waiting for results'}
            />
          </div>
        </section>

        {/* Player Status */}
        <section>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
            Player Status
          </h4>
          <div className="space-y-2">
            <ChecklistItem
              label="Active Players"
              value={data.playerStats.activePlayers}
              status="info"
              details="Approved and not withdrawn"
            />
            {data.playerStats.newRegistrations > 0 && (
              <ChecklistItem
                label="New Registrations"
                value={data.playerStats.newRegistrations}
                status="info"
                details="Approved since last round"
              />
            )}
            {data.playerStats.recentWithdrawals > 0 && (
              <ChecklistItem
                label="Recent Withdrawals"
                value={data.playerStats.recentWithdrawals}
                status="warning"
                details="Withdrawn since last round"
              />
            )}
          </div>
        </section>

        {/* Next Round Preparation */}
        {data.nextRound && (
          <section>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
              Next Round Preparation (Round {data.nextRound.roundNumber})
            </h4>
            <div className="space-y-2">
              <ChecklistItem
                label="Bye Requests Approved"
                value={data.byeRequests.approved.length}
                status={data.byeRequests.approved.length > 0 ? 'info' : 'complete'}
                details={data.byeRequests.approved.length > 0 ? 'Need to be added to SwissSystem' : 'No byes approved'}
              />
              {hasPendingByes && (
                <ChecklistItem
                  label="Pending Bye Requests"
                  value={data.byeRequests.pending.length}
                  status="warning"
                  details={`Deadline: ${new Date(data.nextRound.byeDeadline).toLocaleDateString('de-CH')}`}
                />
              )}
              <ChecklistItem
                label="Expected Games Next Round"
                value={Math.floor((data.playerStats.activePlayers - data.byeRequests.approved.length) / 2)}
                status="info"
                details={`${data.playerStats.activePlayers - data.byeRequests.approved.length} players will play`}
              />
            </div>
          </section>
        )}

        {/* SwissSystem Checklist */}
        <section>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
            SwissSystem.org Actions
          </h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <ol className="space-y-2 text-sm">
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">1</span>
                <span className="text-gray-700 dark:text-gray-300">
                  Enter results for Round {roundNumber} ({data.gameStats.verifiedResults} verified results)
                </span>
              </li>
              {data.byeRequests.approved.length > 0 && (
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">2</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Add byes for Round {data.nextRound?.roundNumber}: {data.byeRequests.approved.map(bye => bye.playerName).join(', ')}
                  </span>
                </li>
              )}
              {data.playerStats.newRegistrations > 0 && (
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">3</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Add {data.playerStats.newRegistrations} new players to tournament
                  </span>
                </li>
              )}
              {data.playerStats.recentWithdrawals > 0 && (
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">4</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Remove {data.playerStats.recentWithdrawals} withdrawn players
                  </span>
                </li>
              )}
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">{data.nextRound ? '5' : '2'}</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {data.nextRound ? `Generate pairings for Round ${data.nextRound.roundNumber}` : 'Tournament complete!'}
                </span>
              </li>
            </ol>
          </div>
        </section>

        {/* Bye Details */}
        {(data.byeRequests.approved.length > 0 || data.byeRequests.pending.length > 0) && (
          <section>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
              Bye Request Details
            </h4>

            <div className="space-y-3">
              {data.byeRequests.approved.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                    Approved Byes ({data.byeRequests.approved.length})
                  </h5>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {data.byeRequests.approved.map((bye) => (
                        <div key={bye.id} className="flex justify-between">
                          <span className="text-green-800 dark:text-green-200 font-medium">{bye.playerName}</span>
                          <span className="text-green-600 dark:text-green-400">
                            {new Date(bye.requestedDate).toLocaleDateString('de-CH')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {data.byeRequests.pending.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                    Pending Byes ({data.byeRequests.pending.length})
                  </h5>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {data.byeRequests.pending.map((bye) => (
                        <div key={bye.id} className="flex justify-between">
                          <span className="text-orange-800 dark:text-orange-200 font-medium">{bye.playerName}</span>
                          <span className="text-orange-600 dark:text-orange-400">
                            {new Date(bye.requestedDate).toLocaleDateString('de-CH')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={fetchChecklistData}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
          >
            Refresh
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}