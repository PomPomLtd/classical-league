'use client'

import { useState, useEffect, useRef } from 'react'

interface Round {
  id: string
  roundNumber: number
  roundDate: string
}

interface Player {
  id: string
  firstName: string
  nickname: string
  lastInitial: string
}

type GameResult = 'WHITE_WIN' | 'BLACK_WIN' | 'DRAW' | 'WHITE_WIN_FF' | 'BLACK_WIN_FF' | 'DOUBLE_FF'

const RESULT_OPTIONS = [
  { value: 'WHITE_WIN', label: '1-0 (White wins)' },
  { value: 'BLACK_WIN', label: '0-1 (Black wins)' },
  { value: 'DRAW', label: '1/2-1/2 (Draw)' },
  { value: 'WHITE_WIN_FF', label: '1-0 FF (White wins by forfeit)' },
  { value: 'BLACK_WIN_FF', label: '0-1 FF (Black wins by forfeit)' },
  { value: 'DOUBLE_FF', label: '0-0 FF (Double forfeit)' },
]

export default function ResultsPage() {
  const [rounds, setRounds] = useState<Round[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedRound, setSelectedRound] = useState('')
  const [boardNumber, setBoardNumber] = useState('')
  const [result, setResult] = useState<GameResult | ''>('')
  const [winningPlayer, setWinningPlayer] = useState('')
  const [playerSearch, setPlayerSearch] = useState('')
  const [showPlayerDropdown, setShowPlayerDropdown] = useState(false)
  const [pgn, setPgn] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchRounds()
  }, [])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPlayerDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchRounds = async () => {
    try {
      const [roundsRes, playersRes] = await Promise.all([
        fetch('/api/rounds/active'),
        fetch('/api/players')
      ])

      if (roundsRes.ok) {
        const roundsData = await roundsRes.json()
        setRounds(roundsData)
        
        // Auto-select current round based on date
        if (roundsData.length > 0) {
          const now = new Date()
          
          // Find the round that's currently active (within 2 weeks of round date)
          const currentRound = roundsData.find((round: Round) => {
            const roundDate = new Date(round.roundDate)
            const twoWeeksBefore = new Date(roundDate.getTime() - 14 * 24 * 60 * 60 * 1000)
            const oneWeekAfter = new Date(roundDate.getTime() + 7 * 24 * 60 * 60 * 1000)
            
            return now >= twoWeeksBefore && now <= oneWeekAfter
          })
          
          if (currentRound) {
            setSelectedRound(currentRound.id)
          } else {
            // If no current round, select the most recent one
            setSelectedRound(roundsData[0].id)
          }
        }
      }

      if (playersRes.ok) {
        const playersData = await playersRes.json()
        setPlayers(playersData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setMessage('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRound || !boardNumber || !result || !pgn.trim()) {
      setMessage('Please fill in all fields')
      return
    }

    // Check if winner is required (for non-draw, non-double forfeit results)
    const requiresWinner = !['DRAW', 'DOUBLE_FF'].includes(result)
    if (requiresWinner && !winningPlayer) {
      setMessage('Please select the winning player')
      return
    }

    // Basic PGN validation
    if (!validatePGN(pgn)) {
      setMessage('Please provide valid PGN notation')
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roundId: selectedRound,
          boardNumber: parseInt(boardNumber),
          result,
          winningPlayerId: winningPlayer || null,
          pgn: pgn.trim()
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Result submitted successfully! Our K4 admin homie will verify and update the official tournament page.')
        // Reset form
        setSelectedRound('')
        setBoardNumber('')
        setResult('')
        setWinningPlayer('')
        setPlayerSearch('')
        setPgn('')
      } else {
        setMessage(data.error || 'Failed to submit result')
      }
    } catch (error) {
      console.error('Error submitting result:', error)
      setMessage('Failed to submit result')
    } finally {
      setSubmitting(false)
    }
  }

  // Basic PGN validation
  const validatePGN = (pgnText: string): boolean => {
    const cleaned = pgnText.trim()
    if (!cleaned) return false
    
    // Check for some common PGN patterns
    const hasGameEnd = /1-0|0-1|1\/2-1\/2|\*/.test(cleaned)
    const hasMoves = /\d+\./.test(cleaned)
    
    return hasGameEnd || hasMoves || cleaned.length > 20 // Accept longer text as potentially valid
  }

  // Filter players for search
  const filteredPlayers = players.filter(player => {
    if (!playerSearch.trim()) return true
    const searchLower = playerSearch.toLowerCase().trim()
    return (
      player.firstName.toLowerCase().includes(searchLower) ||
      player.nickname.toLowerCase().includes(searchLower) ||
      player.lastInitial.toLowerCase().includes(searchLower)
    )
  })

  const handlePlayerSelect = (player: Player) => {
    setWinningPlayer(player.id)
    setPlayerSearch(`${player.firstName} "${player.nickname}" ${player.lastInitial}`)
    setShowPlayerDropdown(false)
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
            Submit Game Result
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Report your game results with complete PGN notation
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
                Result Submission Guidelines
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Winners must submit results within 24 hours of the game</li>
                  <li>Use the board number from the official pairings</li>
                  <li>Include complete PGN notation from your chess platform</li>
                  <li>Our K4 admin homie will verify results and update the official SwissSystem tournament page</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Round Selection */}
            <div>
              <label htmlFor="round" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tournament Round *
              </label>
              <select
                id="round"
                value={selectedRound}
                onChange={(e) => setSelectedRound(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                required
              >
                <option value="">Select round...</option>
                {rounds.map(round => (
                  <option key={round.id} value={round.id}>
                    Round {round.roundNumber} - {new Date(round.roundDate).toLocaleDateString('de-CH')}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Select the round for which you're submitting a result
              </p>
            </div>

            {/* Board Number */}
            <div>
              <label htmlFor="boardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Board Number *
              </label>
              <input
                type="number"
                id="boardNumber"
                min="1"
                max="100"
                value={boardNumber}
                onChange={(e) => setBoardNumber(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="e.g., 1"
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Use the board number from the official pairings on SwissSystem.org
              </p>
            </div>

            {/* Result Selection */}
            <div>
              <label htmlFor="result" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Game Result *
              </label>
              <select
                id="result"
                value={result}
                onChange={(e) => setResult(e.target.value as GameResult)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                required
              >
                <option value="">Select result...</option>
                {RESULT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium">What is a forfeit?</p>
                <p>A forfeit occurs when a player:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Doesn't show up for the scheduled game</li>
                  <li>Doesn't communicate or respond to scheduling attempts</li>
                  <li>Makes it impossible to schedule the game within the round period</li>
                  <li>Abandons the game without a valid reason</li>
                </ul>
              </div>
            </div>

            {/* Winning Player (only show for non-draw/non-double-forfeit results) */}
            {result && !['DRAW', 'DOUBLE_FF'].includes(result) && (
              <div>
                <label htmlFor="winningPlayer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Winning Player *
                </label>
                <div className="mt-1 relative" ref={dropdownRef}>
                  <input
                    type="text"
                    id="winningPlayer"
                    value={playerSearch}
                    onChange={(e) => {
                      setPlayerSearch(e.target.value)
                      setShowPlayerDropdown(true)
                      if (!e.target.value) {
                        setWinningPlayer('')
                      }
                    }}
                    onFocus={() => setShowPlayerDropdown(true)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    placeholder="Search for winning player..."
                    required
                  />
                  
                  {/* Dropdown */}
                  {showPlayerDropdown && players.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {filteredPlayers.slice(0, 10).map((player) => (
                        <button
                          key={player.id}
                          type="button"
                          onClick={() => handlePlayerSelect(player)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                        >
                          {player.firstName} <span className="font-syne-tactile italic">"{player.nickname}"</span> {player.lastInitial}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Type to search for the player who won this game. This helps us match the result even if the board number is wrong.
                </p>
              </div>
            )}

            {/* PGN Input */}
            <div>
              <label htmlFor="pgn" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                PGN Notation *
              </label>
              <textarea
                id="pgn"
                rows={8}
                value={pgn}
                onChange={(e) => setPgn(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm font-mono text-xs"
                placeholder="[Event &quot;Classical League&quot;]
[Site &quot;lichess.org&quot;]
[Date &quot;2025.09.23&quot;]
[White &quot;Player1&quot;]
[Black &quot;Player2&quot;]
[Result &quot;1-0&quot;]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 1-0"
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Copy and paste the complete PGN from lichess.org, chess.com, or your chess app
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-md transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Result'}
              </button>
            </div>

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
              No active rounds available for result submission
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Results can be submitted for current and recent rounds
            </p>
          </div>
        )}

        {/* PGN Help */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            How to get PGN notation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Lichess.org</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to your completed game</li>
                <li>Click the "Share & export" button</li>
                <li>Click "PGN" tab</li>
                <li>Copy the text and paste it above</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Chess.com</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to your completed game</li>
                <li>Click the "Share" button</li>
                <li>Select "Download PGN"</li>
                <li>Open the file and copy the content</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}