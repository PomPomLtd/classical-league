'use client'

import { useState, useEffect } from 'react'

interface ByeRequest {
  id: string
  requestedDate: string
  isApproved: boolean | null
  approvedDate: string | null
  adminNotes: string | null
  player: {
    id: string
    firstName: string
    nickname: string
    lastInitial: string
    fullName: string
  }
  round: {
    id: string
    roundNumber: number
    roundDate: string
    byeDeadline: string
  }
}

type FilterType = 'all' | 'pending' | 'approved' | 'rejected'

export default function AdminByesPage() {
  const [byeRequests, setByeRequests] = useState<ByeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('pending')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchByeRequests()
  }, [])

  const fetchByeRequests = async () => {
    try {
      const response = await fetch('/api/admin/byes')
      if (response.ok) {
        const data = await response.json()
        setByeRequests(data)
      }
    } catch (error) {
      console.error('Error fetching bye requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    try {
      const response = await fetch(`/api/admin/byes/${requestId}/approve`, {
        method: 'POST'
      })
      if (response.ok) {
        fetchByeRequests()
      }
    } catch (error) {
      console.error('Error approving bye request:', error)
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      const response = await fetch(`/api/admin/byes/${requestId}/reject`, {
        method: 'POST'
      })
      if (response.ok) {
        fetchByeRequests()
      }
    } catch (error) {
      console.error('Error rejecting bye request:', error)
    }
  }

  const filteredRequests = byeRequests.filter(request => {
    // Apply status filter
    let matchesFilter = true
    if (filter === 'pending') matchesFilter = request.isApproved === null
    else if (filter === 'approved') matchesFilter = request.isApproved === true
    else if (filter === 'rejected') matchesFilter = request.isApproved === false

    // Apply search filter
    const matchesSearch = search === '' || 
      request.player.fullName.toLowerCase().includes(search.toLowerCase()) ||
      request.player.nickname.toLowerCase().includes(search.toLowerCase()) ||
      request.round.roundNumber.toString().includes(search)

    return matchesFilter && matchesSearch
  })

  const getStatusBadge = (request: ByeRequest) => {
    if (request.isApproved === true) {
      return <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">Approved</span>
    } else if (request.isApproved === false) {
      return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">Rejected</span>
    } else {
      return <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">Pending</span>
    }
  }

  const isDeadlinePassed = (byeDeadline: string) => {
    return new Date() > new Date(byeDeadline)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-gray-500 dark:text-gray-400">Loading bye requests...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bye Request Management</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Review and approve player bye requests
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as FilterType[]).map(filterType => (
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
              placeholder="Search by player name, nickname, or round..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Bye Requests List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-2">No bye requests found</div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {search ? 'Try adjusting your search terms' : 'No bye requests match the current filter'}
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
                    Round
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Requested
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
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {request.player.firstName} <span className="font-syne-tactile italic">"{request.player.nickname}"</span> {request.player.lastInitial}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">Round {request.round.roundNumber}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(request.round.roundDate).toLocaleDateString('de-CH')}
                      </div>
                      <div className={`text-xs ${isDeadlinePassed(request.round.byeDeadline) ? 'text-red-500' : 'text-gray-400'}`}>
                        Deadline: {new Date(request.round.byeDeadline).toLocaleDateString('de-CH', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(request.requestedDate).toLocaleDateString('de-CH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request)}
                      {request.approvedDate && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {new Date(request.approvedDate).toLocaleDateString('de-CH')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.isApproved === null && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Reject
                          </button>
                        </div>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{byeRequests.length}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Requests
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
                    {byeRequests.filter(r => r.isApproved === null).length}
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
                    {byeRequests.filter(r => r.isApproved === true).length}
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
                    {byeRequests.filter(r => r.isApproved === false).length}
                  </span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Rejected
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