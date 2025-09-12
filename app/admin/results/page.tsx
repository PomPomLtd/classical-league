'use client'

import { useState, useEffect } from 'react'

interface GameResult {
  id: string
  boardNumber: number
  result: string
  pgn: string | null
  forfeitReason: string | null
  submittedDate: string
  isVerified: boolean
  verifiedDate: string | null
  adminNotes: string | null
  winningPlayerId: string | null
  round: {
    id: string
    roundNumber: number
    roundDate: string
  }
  winningPlayer?: {
    id: string
    firstName: string
    nickname: string
    lastInitial: string
  } | null
}


type FilterType = 'all' | 'unverified' | 'processed'

const RESULT_LABELS: Record<string, string> = {
  'WHITE_WIN': '1-0',
  'BLACK_WIN': '0-1', 
  'DRAW': '1/2-1/2',
  'WHITE_WIN_FF': '1-0 FF',
  'BLACK_WIN_FF': '0-1 FF',
  'DOUBLE_FF': '0-0 FF',
  'DRAW_FF': '1/2F-1/2F'
}

export default function AdminResultsPage() {
  const [results, setResults] = useState<GameResult[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('unverified')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/results')
      if (response.ok) {
        const resultsData = await response.json()
        setResults(resultsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcess = async (resultId: string) => {
    try {
      const response = await fetch(`/api/admin/results/${resultId}/verify`, {
        method: 'POST'
      })
      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error processing result:', error)
    }
  }


  const filteredResults = results.filter(result => {
    // Apply status filter
    let matchesFilter = true
    if (filter === 'unverified') matchesFilter = !result.isVerified
    else if (filter === 'processed') matchesFilter = result.isVerified

    // Apply search filter
    const matchesSearch = search === '' || 
      result.round.roundNumber.toString().includes(search) ||
      result.boardNumber.toString().includes(search) ||
      result.winningPlayer?.firstName.toLowerCase().includes(search.toLowerCase()) ||
      result.winningPlayer?.nickname.toLowerCase().includes(search.toLowerCase())

    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-gray-500 dark:text-gray-400">Loading results...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Result Management</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Process game results and update the official SwissSystem tournament page
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'unverified', 'processed'] as FilterType[]).map(filterType => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === filterType
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by round, board, or player..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {filteredResults.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-2">No results found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Game
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Winning Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Round {result.round.roundNumber}, Board {result.boardNumber}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(result.round.roundDate).toLocaleDateString('de-CH')}
                      </div>
                      <div className="text-xs text-gray-400">
                        Submitted: {new Date(result.submittedDate).toLocaleDateString('de-CH', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {
                          result.winningPlayer
                            ? `${result.winningPlayer.firstName} "${result.winningPlayer.nickname}" ${result.winningPlayer.lastInitial}`
                            : (['DRAW', 'DOUBLE_FF', 'DRAW_FF'].includes(result.result)
                              ? <span className="text-gray-500 italic">No winner ({result.result === 'DRAW' ? 'Draw' : result.result === 'DRAW_FF' ? 'Scheduling draw' : 'Double forfeit'})</span>
                              : <span className="text-gray-400">Winner not specified</span>)
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {RESULT_LABELS[result.result]}
                      </div>
                      {result.forfeitReason && (
                        <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Reason:</span> {result.forfeitReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {result.isVerified ? (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                          Processed
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!result.isVerified && (
                        <button
                          onClick={() => handleProcess(result.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          Process
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{results.length}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Results
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {results.filter(r => !r.isVerified).length}
                  </span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Unprocessed
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {results.filter(r => r.isVerified).length}
                  </span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Processed
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}