'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
}

type FilterType = 'all' | 'pending' | 'approved' | 'withdrawn'

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/admin/players')
      if (response.ok) {
        const data = await response.json()
        setPlayers(data)
      }
    } catch (error) {
      console.error('Error fetching players:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (playerId: string) => {
    try {
      const response = await fetch(`/api/admin/players/${playerId}/approve`, {
        method: 'POST'
      })
      if (response.ok) {
        fetchPlayers()
      }
    } catch (error) {
      console.error('Error approving player:', error)
    }
  }

  const filteredPlayers = players.filter(player => {
    // Apply status filter
    let matchesFilter = true
    if (filter === 'pending') matchesFilter = !player.isApproved && !player.isWithdrawn
    else if (filter === 'approved') matchesFilter = player.isApproved && !player.isWithdrawn
    else if (filter === 'withdrawn') matchesFilter = player.isWithdrawn

    // Apply search filter
    const matchesSearch = search === '' || 
      player.fullName.toLowerCase().includes(search.toLowerCase()) ||
      player.nickname.toLowerCase().includes(search.toLowerCase()) ||
      player.email.toLowerCase().includes(search.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const getStatusBadge = (player: Player) => {
    if (player.isWithdrawn) {
      return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">Withdrawn</span>
    } else if (player.isApproved) {
      return <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">Approved</span>
    } else {
      return <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">Pending</span>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-gray-500 dark:text-gray-400">Loading players...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Player Management</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Approve player registrations and manage tournament participants
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'approved', 'withdrawn'] as FilterType[]).map(filterType => (
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
              placeholder="Search by name, nickname, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {filteredPlayers.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-2">No players found</div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {search ? 'Try adjusting your search terms' : 'No players match the current filter'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Registration
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
                {filteredPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {player.fullName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {player.nickname}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{player.email}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <a href={`https://wa.me/${player.phoneNumber.replace(/[^0-9]/g, '')}`} 
                           className="hover:text-green-600 dark:hover:text-green-400"
                           target="_blank" rel="noopener noreferrer">
                          {player.phoneNumber}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(player.registrationDate).toLocaleDateString('de-CH')}
                      {player.approvedDate && (
                        <div className="text-xs text-gray-400">
                          Approved: {new Date(player.approvedDate).toLocaleDateString('de-CH')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(player)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!player.isApproved && !player.isWithdrawn && (
                        <button
                          onClick={() => handleApprove(player.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-3"
                        >
                          Approve
                        </button>
                      )}
                      <Link
                        href={`/admin/players/${player.id}`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{players.length}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Players
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
                    {players.filter(p => !p.isApproved && !p.isWithdrawn).length}
                  </span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Pending
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
                    {players.filter(p => p.isApproved && !p.isWithdrawn).length}
                  </span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Approved
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
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {players.filter(p => p.isWithdrawn).length}
                  </span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Withdrawn
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