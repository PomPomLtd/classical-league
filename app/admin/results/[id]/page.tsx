'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import SearchablePlayerDropdown from '@/components/SearchablePlayerDropdown'

// Validation schema
const gameResultEditSchema = z.object({
  boardNumber: z.number().min(1).max(100),
  result: z.enum(['WHITE_WIN', 'BLACK_WIN', 'DRAW', 'WHITE_WIN_FF', 'BLACK_WIN_FF', 'DOUBLE_FF', 'DRAW_FF']),
  pgn: z.string().optional(),
  forfeitReason: z.string().max(500).optional(),
  adminNotes: z.string().max(1000).optional(),
  whitePlayerId: z.string().optional(),
  blackPlayerId: z.string().optional(),
  winningPlayerId: z.string().optional()
})

type GameResultEditData = z.infer<typeof gameResultEditSchema>

interface Player {
  id: string
  firstName: string
  nickname: string
  lastInitial: string
  fullName: string
}

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
  whitePlayerId: string | null
  blackPlayerId: string | null
  winningPlayerId: string | null
  round: {
    id: string
    roundNumber: number
    roundDate: string
  }
  submittedBy: Player | null
  whitePlayer: Player | null
  blackPlayer: Player | null
  winningPlayer: Player | null
}

interface ApprovedPlayer {
  id: string
  firstName: string
  nickname: string
  lastInitial: string
}

const RESULT_LABELS: Record<string, string> = {
  'WHITE_WIN': '1-0 (White wins)',
  'BLACK_WIN': '0-1 (Black wins)',
  'DRAW': '½-½ (Draw)',
  'WHITE_WIN_FF': '1-0 FF (White wins by forfeit)',
  'BLACK_WIN_FF': '0-1 FF (Black wins by forfeit)',
  'DOUBLE_FF': '0-0 FF (Double forfeit)',
  'DRAW_FF': '½F-½F (Scheduling draw)'
}

const RESULT_OPTIONS = [
  { value: 'WHITE_WIN', label: '1-0 (White wins)' },
  { value: 'BLACK_WIN', label: '0-1 (Black wins)' },
  { value: 'DRAW', label: '½-½ (Draw)' },
  { value: 'WHITE_WIN_FF', label: '1-0 FF (White wins by forfeit)' },
  { value: 'BLACK_WIN_FF', label: '0-1 FF (Black wins by forfeit)' },
  { value: 'DOUBLE_FF', label: '0-0 FF (Double forfeit)' },
  { value: 'DRAW_FF', label: '½F-½F (Scheduling draw)' }
]

export default function AdminResultDetailPage() {
  const params = useParams()
  const [result, setResult] = useState<GameResult | null>(null)
  const [players, setPlayers] = useState<ApprovedPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  const resultId = params.id as string

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    reset,
    setValue,
    watch
  } = useForm<GameResultEditData>({
    resolver: zodResolver(gameResultEditSchema)
  })

  const watchResult = watch('result')
  const watchWhitePlayer = watch('whitePlayerId')
  const watchBlackPlayer = watch('blackPlayerId')

  const fetchResult = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/results/${resultId}`)
      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else if (response.status === 404) {
        setError('Result not found')
      } else {
        setError('Failed to load result')
      }
    } catch (error) {
      console.error('Error fetching result:', error)
      setError('Failed to load result')
    } finally {
      setLoading(false)
    }
  }, [resultId])

  const fetchPlayers = useCallback(async () => {
    try {
      const response = await fetch('/api/players')
      if (response.ok) {
        const data = await response.json()
        setPlayers(data)
      }
    } catch (error) {
      console.error('Error fetching players:', error)
    }
  }, [])

  useEffect(() => {
    fetchResult()
    fetchPlayers()
  }, [resultId, fetchResult, fetchPlayers])

  const handleVerify = async () => {
    if (!result || actionLoading) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/results/${result.id}/verify`, {
        method: 'POST'
      })
      if (response.ok) {
        await fetchResult()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to verify result')
      }
    } catch (error) {
      console.error('Error verifying result:', error)
      alert('Failed to verify result')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditClick = () => {
    if (!result) return

    // Pre-populate form with current result data
    setValue('boardNumber', result.boardNumber)
    setValue('result', result.result as 'WHITE_WIN' | 'BLACK_WIN' | 'DRAW' | 'WHITE_WIN_FF' | 'BLACK_WIN_FF' | 'DOUBLE_FF' | 'DRAW_FF')
    setValue('pgn', result.pgn || '')
    setValue('forfeitReason', result.forfeitReason || '')
    setValue('adminNotes', result.adminNotes || '')
    setValue('whitePlayerId', result.whitePlayerId || '')
    setValue('blackPlayerId', result.blackPlayerId || '')
    setValue('winningPlayerId', result.winningPlayerId || '')

    setIsEditModalOpen(true)
  }

  const handleEditSubmit = async (data: GameResultEditData) => {
    if (!result) return

    setEditLoading(true)
    try {
      const response = await fetch(`/api/admin/results/${result.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        await fetchResult()
        setIsEditModalOpen(false)
        reset()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to update result')
      }
    } catch (error) {
      console.error('Error updating result:', error)
      alert('Failed to update result')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDiscardEdit = () => {
    setIsEditModalOpen(false)
    reset()
  }

  // Helper to check if result is a forfeit
  const isForfeitResult = (resultType: string) => {
    return ['WHITE_WIN_FF', 'BLACK_WIN_FF', 'DOUBLE_FF', 'DRAW_FF'].includes(resultType)
  }

  // Helper to check if result is a draw
  const isDrawResult = (resultType: string) => {
    return ['DRAW', 'DOUBLE_FF', 'DRAW_FF'].includes(resultType)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-gray-500 dark:text-gray-400">Loading result...</div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">{error || 'Result not found'}</div>
        <Link
          href="/admin/results"
          className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          ← Back to Results
        </Link>
      </div>
    )
  }

  const getStatusBadge = () => {
    if (result.isVerified) {
      return <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">Processed</span>
    } else {
      return <span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">Pending</span>
    }
  }

  const formatPlayerName = (player: Player | null) => {
    if (!player) return 'Not assigned'
    return `${player.firstName} "${player.nickname}" ${player.lastInitial}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/results"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Round {result.round.roundNumber}, Board {result.boardNumber}
          </h1>
          {getStatusBadge()}
        </div>

        <div className="flex space-x-3">
          {!result.isVerified && (
            <button
              onClick={handleVerify}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {actionLoading ? 'Processing...' : 'Mark as Processed'}
            </button>
          )}
        </div>
      </div>

      {/* Game Information */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Game Information</h2>
            <button
              onClick={handleEditClick}
              title="Edit"
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="px-6 py-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Board Number</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{result.boardNumber}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Round</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                Round {result.round.roundNumber} • {new Date(result.round.roundDate).toLocaleDateString('de-CH')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Result</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{RESULT_LABELS[result.result]}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">White Player</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formatPlayerName(result.whitePlayer)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Black Player</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formatPlayerName(result.blackPlayer)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Winner</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {result.winningPlayer ? formatPlayerName(result.winningPlayer) : 'Draw'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted By</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {result.submittedBy ? formatPlayerName(result.submittedBy) : 'Unknown'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted Date</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {new Date(result.submittedDate).toLocaleDateString('de-CH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* PGN or Forfeit Reason */}
      {(result.pgn || result.forfeitReason) && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {result.pgn ? 'PGN Notation' : 'Forfeit Reason'}
            </h2>
          </div>
          <div className="px-6 py-4">
            {result.pgn ? (
              <pre className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-x-auto font-mono whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
                {result.pgn}
              </pre>
            ) : (
              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                {result.forfeitReason}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Admin Notes */}
      {result.adminNotes && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Admin Notes</h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
              {result.adminNotes}
            </p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Timeline</h2>
        </div>
        <div className="px-6 py-4">
          <div className="flow-root">
            <ul className="-mb-8">
              <li>
                <div className="relative pb-8">
                  {result.verifiedDate && (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-900 dark:text-white">Submitted</span>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(result.submittedDate).toLocaleDateString('de-CH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              {result.verifiedDate && (
                <li>
                  <div className="relative">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">Processed</span>
                          </div>
                          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(result.verifiedDate).toLocaleDateString('de-CH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Edit Modal - To be continued in next part */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Edit Game Result
              </h3>
            </div>

            <form onSubmit={handleSubmit(handleEditSubmit)} className="px-6 py-4 space-y-6">
              {/* Board Number */}
              <div>
                <label htmlFor="edit-boardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Board Number *
                </label>
                <input
                  {...register('boardNumber', { valueAsNumber: true })}
                  type="number"
                  id="edit-boardNumber"
                  min="1"
                  max="100"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
                />
                {formErrors.boardNumber && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {formErrors.boardNumber.message}
                  </p>
                )}
              </div>

              {/* Result Type */}
              <div>
                <label htmlFor="edit-result" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Result *
                </label>
                <select
                  {...register('result')}
                  id="edit-result"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
                >
                  {RESULT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {formErrors.result && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {formErrors.result.message}
                  </p>
                )}
              </div>

              {/* Player Assignments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SearchablePlayerDropdown
                  players={players}
                  selectedPlayerId={watchWhitePlayer || ''}
                  onPlayerSelect={(playerId) => setValue('whitePlayerId', playerId)}
                  label="White Player"
                  placeholder="Search for white player..."
                  excludePlayerIds={watchBlackPlayer ? [watchBlackPlayer] : []}
                />

                <SearchablePlayerDropdown
                  players={players}
                  selectedPlayerId={watchBlackPlayer || ''}
                  onPlayerSelect={(playerId) => setValue('blackPlayerId', playerId)}
                  label="Black Player"
                  placeholder="Search for black player..."
                  excludePlayerIds={watchWhitePlayer ? [watchWhitePlayer] : []}
                />
              </div>

              {/* Winning Player */}
              {!isDrawResult(watchResult || result.result) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Winning Player
                  </label>
                  <SearchablePlayerDropdown
                    players={players}
                    selectedPlayerId={watch('winningPlayerId') || ''}
                    onPlayerSelect={(playerId) => setValue('winningPlayerId', playerId)}
                    label=""
                    placeholder="Search for winning player..."
                  />
                </div>
              )}

              {/* PGN or Forfeit Reason */}
              {isForfeitResult(watchResult || result.result) ? (
                <div>
                  <label htmlFor="edit-forfeitReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Forfeit Reason *
                  </label>
                  <textarea
                    {...register('forfeitReason')}
                    id="edit-forfeitReason"
                    rows={4}
                    maxLength={500}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
                    placeholder="Explain what happened..."
                  />
                  {formErrors.forfeitReason && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {formErrors.forfeitReason.message}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label htmlFor="edit-pgn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    PGN Notation *
                  </label>
                  <textarea
                    {...register('pgn')}
                    id="edit-pgn"
                    rows={10}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2 font-mono text-xs"
                    placeholder="Paste PGN notation here..."
                  />
                  {formErrors.pgn && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {formErrors.pgn.message}
                    </p>
                  )}
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <label htmlFor="edit-adminNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  {...register('adminNotes')}
                  id="edit-adminNotes"
                  rows={3}
                  maxLength={1000}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
                  placeholder="Add any additional notes..."
                />
                {formErrors.adminNotes && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {formErrors.adminNotes.message}
                  </p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleDiscardEdit}
                  disabled={editLoading}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {editLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
