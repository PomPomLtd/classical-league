'use client'

import { useState, useEffect } from 'react'

interface Player {
  id: string
  firstName: string
  nickname: string
  lastInitial: string
  fullName: string
}

interface Round {
  id: string
  roundNumber: number
  roundDate: string
  byeDeadline: string
  isDeadlinePassed: boolean
}

interface ExistingByeRequest {
  roundId: string
  isApproved: boolean | null
}

export default function ByesPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [rounds, setRounds] = useState<Round[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [selectedRounds, setSelectedRounds] = useState<string[]>([])
  const [existingRequests, setExistingRequests] = useState<ExistingByeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedPlayer) {
      fetchExistingRequests(selectedPlayer)
    }
  }, [selectedPlayer])

  const fetchData = async () => {
    try {
      const [playersRes, roundsRes] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/rounds/upcoming')
      ])

      if (playersRes.ok) {
        const playersData = await playersRes.json()
        setPlayers(playersData)
      }

      if (roundsRes.ok) {
        const roundsData = await roundsRes.json()
        setRounds(roundsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setMessage('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchExistingRequests = async (playerId: string) => {
    try {
      const response = await fetch(`/api/byes/player/${playerId}`)
      if (response.ok) {
        const data = await response.json()
        setExistingRequests(data)
      }
    } catch (error) {
      console.error('Error fetching existing requests:', error)
    }
  }

  const handleRoundToggle = (roundId: string) => {
    setSelectedRounds(prev => 
      prev.includes(roundId) 
        ? prev.filter(id => id !== roundId)
        : [...prev, roundId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlayer || selectedRounds.length === 0) {
      setMessage('Please select a player and at least one round')
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/byes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playerId: selectedPlayer,
          roundIds: selectedRounds
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Bye request submitted successfully! Our chess organizer will review your request.')
        setSelectedRounds([])
        fetchExistingRequests(selectedPlayer)
      } else {
        setMessage(data.error || 'Failed to submit bye request')
      }
    } catch (error) {
      console.error('Error submitting bye request:', error)
      setMessage('Failed to submit bye request')
    } finally {
      setSubmitting(false)
    }
  }

  const getRoundStatus = (round: Round) => {
    const existing = existingRequests.find(req => req.roundId === round.id)
    if (existing) {
      if (existing.isApproved === true) return 'approved'
      if (existing.isApproved === false) return 'rejected'
      return 'pending'
    }
    return round.isDeadlinePassed ? 'deadline-passed' : 'available'
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'approved': return { text: 'Approved', class: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' }
      case 'rejected': return { text: 'Rejected', class: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' }
      case 'pending': return { text: 'Pending', class: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' }
      case 'deadline-passed': return { text: 'Deadline Passed', class: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' }
      default: return { text: 'Available', class: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' }
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Request Bye
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Skip rounds when you can&apos;t play - deadline is Wednesday at noon before each round
          </p>
        </div>

        {/* Info Alert */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Bye Request Information
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Bye requests must be submitted before Wednesday 12:00 noon</li>
                  <li>Bye rounds score 0.5 points (half point)</li>
                  <li>No limit on the number of bye rounds per player</li>
                  <li>Chess organizer approval required - you&apos;ll be notified of the decision</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Player Selection */}
            <div>
              <label htmlFor="player" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Player
              </label>
              <select
                id="player"
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                required
              >
                <option value="">Choose a player...</option>
                {players.map(player => (
                  <option key={player.id} value={player.id}>
                    {player.firstName} &quot;{player.nickname}&quot; {player.lastInitial}
                  </option>
                ))}
              </select>
            </div>

            {/* Round Selection */}
            {selectedPlayer && rounds.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Rounds for Bye
                </label>
                <div className="space-y-3">
                  {rounds.map(round => {
                    const status = getRoundStatus(round)
                    const statusDisplay = getStatusDisplay(status)
                    const canSelect = status === 'available'
                    const isSelected = selectedRounds.includes(round.id)

                    return (
                      <div key={round.id} className={`p-4 border rounded-lg ${statusDisplay.bg} ${canSelect ? 'cursor-pointer hover:shadow-sm' : 'cursor-not-allowed opacity-75'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id={`round-${round.id}`}
                              checked={isSelected}
                              onChange={() => canSelect && handleRoundToggle(round.id)}
                              disabled={!canSelect}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <div>
                              <label htmlFor={`round-${round.id}`} className="text-sm font-medium text-gray-900 dark:text-white">
                                Round {round.roundNumber}
                              </label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Game date: {new Date(round.roundDate).toLocaleDateString('de-CH', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                Bye deadline: {new Date(round.byeDeadline).toLocaleDateString('de-CH', { 
                                  weekday: 'short',
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusDisplay.class} ${statusDisplay.bg}`}>
                            {statusDisplay.text}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Submit Button */}
            {selectedPlayer && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || selectedRounds.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Bye Request'}
                </button>
              </div>
            )}

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-md ${message.includes('successfully') ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'}`}>
                {message}
              </div>
            )}
          </form>
        </div>

        {/* No rounds available */}
        {rounds.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              No upcoming rounds available for bye requests
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Bye requests open closer to each round date
            </p>
          </div>
        )}
      </div>
    </div>
  )
}