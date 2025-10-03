'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { playerRegistrationSchema, type PlayerRegistrationData } from '@/lib/validations'

interface Player {
  id: string
  fullName: string
  email: string
  nickname: string
  phoneNumber: string
  registrationDate: string
  isApproved: boolean
  isWithdrawn: boolean
  approvedDate?: string
  withdrawalDate?: string
  lichessRating?: number
}

export default function AdminPlayerDetailPage() {
  const params = useParams()
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  const playerId = params.id as string

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    reset,
    setValue
  } = useForm<PlayerRegistrationData>({
    resolver: zodResolver(playerRegistrationSchema)
  })

  const fetchPlayer = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/players/${playerId}`)
      if (response.ok) {
        const data = await response.json()
        setPlayer(data)
      } else if (response.status === 404) {
        setError('Player not found')
      } else {
        setError('Failed to load player')
      }
    } catch (error) {
      console.error('Error fetching player:', error)
      setError('Failed to load player')
    } finally {
      setLoading(false)
    }
  }, [playerId])

  useEffect(() => {
    fetchPlayer()
  }, [playerId, fetchPlayer])

  const handleApprove = async () => {
    if (!player || actionLoading) return
    
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/players/${player.id}/approve`, {
        method: 'POST'
      })
      if (response.ok) {
        await fetchPlayer() // Reload player data
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to approve player')
      }
    } catch (error) {
      console.error('Error approving player:', error)
      alert('Failed to approve player')
    } finally {
      setActionLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!player || actionLoading) return
    
    const confirmed = confirm(`Are you sure you want to withdraw ${player.fullName}?`)
    if (!confirmed) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/players/${player.id}/withdraw`, {
        method: 'POST'
      })
      if (response.ok) {
        await fetchPlayer() // Reload player data
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to withdraw player')
      }
    } catch (error) {
      console.error('Error withdrawing player:', error)
      alert('Failed to withdraw player')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditClick = () => {
    if (!player) return
    
    // Pre-populate form with current player data
    setValue('fullName', player.fullName)
    setValue('email', player.email)
    setValue('phoneNumber', player.phoneNumber)
    setValue('nickname', player.nickname)
    setValue('lichessRating', (player.lichessRating || 1500).toString())
    setValue('rulesAccepted', true) // Always true for existing players
    
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = async (data: PlayerRegistrationData) => {
    if (!player) return
    
    setEditLoading(true)
    try {
      const response = await fetch(`/api/admin/players/${player.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          lichessRating: parseInt(data.lichessRating)
        })
      })
      
      if (response.ok) {
        await fetchPlayer() // Reload player data
        setIsEditModalOpen(false)
        reset()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to update player')
      }
    } catch (error) {
      console.error('Error updating player:', error)
      alert('Failed to update player')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDiscardEdit = () => {
    setIsEditModalOpen(false)
    reset()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-gray-500 dark:text-gray-400">Loading player...</div>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">{error || 'Player not found'}</div>
        <Link
          href="/admin/players"
          className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          ← Back to Players
        </Link>
      </div>
    )
  }

  const getStatusBadge = () => {
    if (player.isWithdrawn) {
      return <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">Withdrawn</span>
    } else if (player.isApproved) {
      return <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">Approved</span>
    } else {
      return <span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">Pending Approval</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/players"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {player.fullName}
          </h1>
          {getStatusBadge()}
        </div>
        
        <div className="flex space-x-3">
          {!player.isApproved && !player.isWithdrawn && (
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {actionLoading ? 'Approving...' : 'Approve Player'}
            </button>
          )}
          {!player.isWithdrawn && (
            <button
              onClick={handleWithdraw}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {actionLoading ? 'Processing...' : 'Withdraw Player'}
            </button>
          )}
        </div>
      </div>

      {/* Player Details */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Player Information</h2>
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
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{player.fullName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nickname</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{player.nickname}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Lichess Rating</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{player.lichessRating || 1500}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                <a href={`mailto:${player.email}`} className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  {player.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                <a 
                  href={`https://wa.me/${player.phoneNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-500 dark:text-green-400 inline-flex items-center"
                >
                  {player.phoneNumber}
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </a>
              </dd>
            </div>
          </div>
        </div>
      </div>

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
                          <span className="font-medium text-gray-900 dark:text-white">Registered</span>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(player.registrationDate).toLocaleDateString('de-CH', {
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
              
              {player.approvedDate && (
                <li>
                  <div className="relative pb-8">
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
                            <span className="font-medium text-gray-900 dark:text-white">Approved</span>
                          </div>
                          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(player.approvedDate).toLocaleDateString('de-CH', {
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

              {player.withdrawalDate && (
                <li>
                  <div className="relative">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">Withdrawn</span>
                          </div>
                          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(player.withdrawalDate).toLocaleDateString('de-CH', {
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

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Edit Player Information
              </h3>
            </div>
            
            <form onSubmit={handleSubmit(handleEditSubmit)} className="px-6 py-4 space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="edit-fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  {...register('fullName')}
                  type="text"
                  id="edit-fullName"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
                  placeholder="Full name"
                />
                {formErrors.fullName && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {formErrors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="edit-email"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
                  placeholder="email@example.com"
                />
                {formErrors.email && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {formErrors.email.message}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="edit-phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number (with Country Code) *
                </label>
                <input
                  {...register('phoneNumber')}
                  type="tel"
                  id="edit-phoneNumber"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
                  placeholder="+41 79 123 4567"
                />
                {formErrors.phoneNumber && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {formErrors.phoneNumber.message}
                  </p>
                )}
              </div>

              {/* Nickname */}
              <div>
                <label htmlFor="edit-nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chess Player Name *
                </label>
                <input
                  {...register('nickname')}
                  type="text"
                  id="edit-nickname"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
                  placeholder="Chess nickname"
                />
                {formErrors.nickname && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {formErrors.nickname.message}
                  </p>
                )}
              </div>

              {/* Lichess Classical Rating */}
              <div>
                <label htmlFor="edit-lichessRating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lichess Classical Rating *
                </label>
                <input
                  {...register('lichessRating')}
                  type="number"
                  id="edit-lichessRating"
                  min="100"
                  max="3000"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
                  placeholder="1500"
                />
                {formErrors.lichessRating && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {formErrors.lichessRating.message}
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