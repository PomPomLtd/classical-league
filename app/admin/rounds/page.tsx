'use client'

import { useState, useEffect } from 'react'
import BroadcastSetupInstructions from '@/components/BroadcastSetupInstructions'
import RoundChecklist from '@/components/RoundChecklist'

interface Round {
  id: string
  roundNumber: number
  roundDate: string
  byeDeadline: string
  pgnFilePath?: string
  pgnUpdatedAt?: string
  lichessBroadcastUrl?: string
}

interface Season {
  id: string
  seasonNumber: number
  name: string
  rounds: Round[]
}

export default function AdminRoundsPage() {
  const [season, setSeason] = useState<Season | null>(null)
  const [loading, setLoading] = useState(true)
  const [notificationLoading, setNotificationLoading] = useState<string | null>(null)
  const [broadcastInfo, setBroadcastInfo] = useState<{
    season?: { id: string; name: string; seasonNumber: number }
    rounds?: Array<{
      id: string
      roundNumber: number
      gameCount: number
      pgnUrl: string
      lastUpdated?: string
    }>
    settings?: { broadcastEnabled: boolean }
  } | null>(null)
  const [showBroadcastSetup, setShowBroadcastSetup] = useState(false)
  const [selectedRoundChecklist, setSelectedRoundChecklist] = useState<{ id: string; number: number } | null>(null)
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | null
    text: string
  }>({ type: null, text: '' })

  useEffect(() => {
    fetchCurrentSeason()
    fetchBroadcastInfo()
  }, [])

  const fetchBroadcastInfo = async () => {
    try {
      const response = await fetch('/api/broadcast/rounds')
      if (response.ok) {
        const data = await response.json()
        setBroadcastInfo(data)
      }
    } catch (error) {
      console.error('Error fetching broadcast info:', error)
      // Don't show broadcast section if there's an error (e.g., missing database columns)
      setBroadcastInfo(null)
    }
  }

  const fetchCurrentSeason = async () => {
    try {
      const response = await fetch('/api/admin/seasons/current')
      if (response.ok) {
        const data = await response.json()
        setSeason(data)
      }
    } catch (error) {
      console.error('Error fetching season:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNotifyPairings = async (roundId: string, roundNumber: number) => {
    if (!confirm(`Send pairing notifications to all players for Round ${roundNumber}?`)) {
      return
    }

    setNotificationLoading(roundId)
    setMessage({ type: null, text: '' })

    try {
      const response = await fetch(`/api/admin/rounds/${roundId}/notify-pairings`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `Successfully sent pairing notifications to ${data.playersNotified} players for Round ${roundNumber}`
        })
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to send notifications'
        })
      }
    } catch (error) {
      console.error('Error sending notifications:', error)
      setMessage({
        type: 'error',
        text: 'Failed to send notifications'
      })
    } finally {
      setNotificationLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-gray-500 dark:text-gray-400">Loading rounds...</div>
      </div>
    )
  }

  if (!season) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 mb-4">No active season found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Round Management</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Send pairing notifications and manage tournament rounds
          </p>
        </div>
      </div>

      {/* Message Display */}
      {message.type && (
        <div className={`rounded-md p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Season Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-200">
          {season.name}
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          {season.rounds.length} rounds • Season {season.seasonNumber}
        </p>
      </div>

      {/* Rounds List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Tournament Rounds
          </h3>
          
          <div className="space-y-4">
            {season.rounds.map((round) => {
              const roundDate = new Date(round.roundDate)
              
              // Calculate the bi-weekly playing period
              // Round date is when pairings are published (Wednesday)
              // Players have exactly 2 weeks to play until the next Wednesday
              const pairingDate = new Date(roundDate) // When pairings are published
              const deadlineDate = new Date(roundDate)
              deadlineDate.setDate(roundDate.getDate() + 14) // 2 weeks later
              
              const isPast = roundDate < new Date()
              const isNotifying = notificationLoading === round.id

              return (
                <div key={round.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
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
                        onClick={() => setSelectedRoundChecklist({ id: round.id, number: round.roundNumber })}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Checklist
                      </button>
                      <button
                        onClick={() => handleNotifyPairings(round.id, round.roundNumber)}
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
            })}
          </div>
        </div>
      </div>

      {/* Lichess Broadcast Section */}
      {broadcastInfo && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Lichess Broadcast Integration
              </h3>
              <button
                onClick={() => setShowBroadcastSetup(!showBroadcastSetup)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                {showBroadcastSetup ? 'Hide' : 'Show'} Setup Instructions
              </button>
            </div>

            {/* Broadcast Status */}
            <div className="mb-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Broadcast Status:
                  </span>
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    broadcastInfo.settings?.broadcastEnabled
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {broadcastInfo.settings?.broadcastEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Tournament: {broadcastInfo.season?.name}
                </div>
              </div>
            </div>

            {/* Round PGN URLs */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Round PGN URLs</h4>
              {broadcastInfo.rounds?.map((round) => (
                <div key={round.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-md">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Round {round.roundNumber}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {round.gameCount} games
                    </span>
                    {round.lastUpdated && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Updated: {new Date(round.lastUpdated).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={round.pgnUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      View PGN
                    </a>
                    <button
                      onClick={() => navigator.clipboard.writeText(round.pgnUrl)}
                      className="text-sm text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Setup Instructions */}
            {showBroadcastSetup && broadcastInfo.rounds && (
              <div className="mt-6">
                <BroadcastSetupInstructions
                  rounds={broadcastInfo.rounds.map((r) => ({
                    id: r.id,
                    roundNumber: r.roundNumber,
                    pgnUrl: r.pgnUrl,
                    gameCount: r.gameCount
                  }))}
                  seasonName={broadcastInfo.season?.name || 'Classical League'}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              About Round Notifications
            </h3>
            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <p>• Email notifications will be sent to all approved players</p>
              <p>• Players with approved byes will receive bye confirmation emails</p>
              <p>• Players without byes will be directed to check SwissSystem.org for pairings</p>
              <p>• Only send notifications when pairings are officially published</p>
            </div>
          </div>
        </div>
      </div>

      {/* Round Checklist Modal */}
      {selectedRoundChecklist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <RoundChecklist
              roundId={selectedRoundChecklist.id}
              roundNumber={selectedRoundChecklist.number}
              onClose={() => setSelectedRoundChecklist(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}