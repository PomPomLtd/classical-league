'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { playerRegistrationSchema, type PlayerRegistrationData } from '@/lib/validations'
import { generateChessNickname } from '@/lib/nickname-generator'
import Link from 'next/link'

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<PlayerRegistrationData>({
    resolver: zodResolver(playerRegistrationSchema)
  })

  const watchedFields = watch(['fullName', 'nickname', 'lichessRating'])
  const fullName = watchedFields[0] || ''
  const nickname = watchedFields[1] || ''
  const rating = watchedFields[2] || '1500'
  
  // Extract first name and last initial from full name
  const nameParts = fullName.trim().split(' ')
  const firstName = nameParts[0] || ''
  const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0).toUpperCase() + '.' : ''

  const onSubmit = async (data: PlayerRegistrationData) => {
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/players/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: result.message
        })
        reset() // Clear form
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Registration failed. Please try again.'
        })
      }
    } catch {
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuggestNickname = () => {
    const suggestedNickname = generateChessNickname()
    setValue('nickname', suggestedNickname, { shouldValidate: true })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Register for Season 2
        </h1>

        {/* Tournament Information */}
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
            🏆 Welcome to Schachklub Kreis 4 Classical League!
          </h2>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
            <p className="font-medium">
              ♟️ <strong>All skill levels welcome!</strong> Whether you&apos;re a complete beginner or a seasoned player, this tournament is for everyone.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div>
                <p><strong>📅 Start:</strong> 23.9.2025</p>
                <p><strong>⏰ Schedule:</strong> Every 2 weeks</p>
                <p><strong>🎯 Rounds:</strong> 7 total rounds</p>
              </div>
              <div>
                <p><strong>🏅 Format:</strong> Swiss system</p>
                <p><strong>⏱️ Time control:</strong> 30+30</p>
                <p><strong>📱 Contact:</strong> WhatsApp groups</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border-l-4 border-blue-400">
              <p className="text-xs">
                <strong>Never played in a tournament?</strong> No problem! Our friendly community will help you learn the ropes. 
                We have players of all levels, from absolute beginners to experienced tournament players. 
                Join us for a fun, supportive chess experience! 🤝
              </p>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {submitStatus.type === 'success' && (
          <div className="mb-6 rounded-md bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {submitStatus.message}
                </p>
                <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                  You will be notified once our chess organizer approves your registration.
                </p>
              </div>
            </div>
          </div>
        )}

        {submitStatus.type === 'error' && (
          <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {submitStatus.message}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name *
            </label>
            <input
              {...register('fullName')}
              type="text"
              id="fullName"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
              placeholder="Your full name"
            />
            {errors.fullName && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address *
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number (with Country Code) *
            </label>
            <input
              {...register('phoneNumber')}
              type="tel"
              id="phoneNumber"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
              placeholder="+41 79 123 4567"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Required for WhatsApp contact with other players
            </p>
            {errors.phoneNumber && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Nickname */}
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chess Player Name *
            </label>
            <div className="flex gap-2">
              <input
                {...register('nickname')}
                type="text"
                id="nickname"
                className="block flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
                placeholder="The Bishop Bludgeoner"
              />
              <button
                type="button"
                onClick={handleSuggestNickname}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                title="Generate a creative chess nickname"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
                Suggest
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This will be displayed in the player directory
            </p>
            {errors.nickname && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.nickname.message}
              </p>
            )}
          </div>

          {/* Lichess Classical Rating */}
          <div>
            <label htmlFor="lichessRating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Lichess Classical Rating *
            </label>
            <input
              {...register('lichessRating')}
              type="number"
              id="lichessRating"
              min="100"
              max="3000"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
              placeholder="1500"
            />
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p className="font-medium">How to find your rating:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><strong>Best:</strong> Use your Lichess Classical rating</li>
                <li><strong>Alternative:</strong> Use Lichess Rapid rating</li>
                <li><strong>Chess.com users:</strong> Add 150 to your Chess.com Classical/Rapid rating</li>
                <li><strong>No classical/rapid rating?</strong> Use your Blitz rating</li>
                <li><strong>No online rating?</strong> Enter 500 (we&apos;ll adjust after your first games)</li>
              </ul>
              <p className="text-xs italic mt-2">This helps create balanced pairings in the Swiss system</p>
            </div>
            {errors.lichessRating && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.lichessRating.message}
              </p>
            )}
          </div>

          {/* Player Card Preview */}
          {(fullName || nickname) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Player Card Preview
              </label>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6 border-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {firstName && (
                      <>
                        {firstName}
                        {nickname && (
                          <>
                            {' '}
                            <span className="font-syne-tactile italic text-indigo-600 dark:text-indigo-400">
                              &quot;{nickname}&quot;
                            </span>
                          </>
                        )}
                        {lastInitial && (
                          <span className="ml-2">{lastInitial}</span>
                        )}
                      </>
                    )}
                    {!firstName && <span className="text-gray-400">Your name will appear here</span>}
                  </div>
                  <div className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                    Rating: {rating || '1500'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rules Acceptance */}
          <div>
            <div className="flex items-start">
              <input
                {...register('rulesAccepted')}
                type="checkbox"
                id="rulesAccepted"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <div className="ml-3">
                <label htmlFor="rulesAccepted" className="text-sm text-gray-700 dark:text-gray-300">
                  I have read and accept the{' '}
                  <Link href="/rules" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 underline">
                    tournament rules
                  </Link>{' '}
                  *
                </label>
              </div>
            </div>
            {errors.rulesAccepted && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.rulesAccepted.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </div>
            ) : (
              'Register for Tournament'
            )}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            * Required fields
          </p>
        </form>

        {/* Additional Information */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            What happens after registration?
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Your registration will be reviewed by our chess organizer</li>
            <li>• You will be manually added to the swissystem.org tournament</li>
            <li>• Once approved, you&apos;ll appear in the player directory</li>
            <li>• You can then request byes and submit results</li>
          </ul>
        </div>
      </div>
    </div>
  )
}