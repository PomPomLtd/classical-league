'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const settingsSchema = z.object({
  tournamentLink: z.string().url().optional().or(z.literal('')),
  currentSeasonId: z.string().min(1, 'Please select a season')
})

type SettingsData = z.infer<typeof settingsSchema>

interface Season {
  id: string
  seasonNumber: number
  name: string
  isActive: boolean
  startDate: string
  endDate: string
}

interface Settings {
  tournamentLink: string | null
  currentSeasonId: string
}

export default function AdminSettingsPage() {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<SettingsData>({
    resolver: zodResolver(settingsSchema)
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [seasonsRes, settingsRes] = await Promise.all([
        fetch('/api/admin/seasons'),
        fetch('/api/admin/settings')
      ])

      if (seasonsRes.ok) {
        const seasonsData = await seasonsRes.json()
        setSeasons(seasonsData)
      }

      if (settingsRes.ok) {
        const settingsData: Settings = await settingsRes.json()
        setValue('tournamentLink', settingsData.tournamentLink || '')
        setValue('currentSeasonId', settingsData.currentSeasonId)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setMessage('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: SettingsData) => {
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setMessage('Settings saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        const errorData = await response.json()
        setMessage(errorData.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-gray-500 dark:text-gray-400">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tournament Settings</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Manage tournament configuration and season settings
        </p>
      </div>

      {/* Settings Form */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Tournament Link */}
          <div>
            <label htmlFor="tournamentLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              SwissSystem.org Tournament Link
            </label>
            <input
              {...register('tournamentLink')}
              type="url"
              id="tournamentLink"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="https://swisssystem.org/tournament/..."
            />
            {errors.tournamentLink && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.tournamentLink.message}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Official tournament page link for pairings and standings
            </p>
          </div>

          {/* Current Season */}
          <div>
            <label htmlFor="currentSeasonId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Active Season
            </label>
            <select
              {...register('currentSeasonId')}
              id="currentSeasonId"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              <option value="">Select active season...</option>
              {seasons.map(season => (
                <option key={season.id} value={season.id}>
                  {season.name} (Season {season.seasonNumber})
                  {season.isActive ? ' - Currently Active' : ''}
                </option>
              ))}
            </select>
            {errors.currentSeasonId && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.currentSeasonId.message}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              The season that is currently accepting registrations and results
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {saving ? 'Saving...' : 'Save Settings'}
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

      {/* Season Management Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Season Management</h2>
        
        <div className="space-y-4">
          {seasons.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No seasons found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Season
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Period
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
                  {seasons.map((season) => (
                    <tr key={season.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {season.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Season {season.seasonNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(season.startDate).toLocaleDateString('de-CH')} - {new Date(season.endDate).toLocaleDateString('de-CH')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {season.isActive ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                        >
                          View Details
                        </button>
                        {!season.isActive && (
                          <button
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            Activate
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

        <div className="mt-6">
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Create New Season
          </button>
        </div>
      </div>
    </div>
  )
}