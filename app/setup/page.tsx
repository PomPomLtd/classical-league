'use client'

import { useState } from 'react'

export default function SetupPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState<any>(null)

  const runMigration = async () => {
    setStatus('loading')
    setMessage('Running database migration...')
    
    try {
      const response = await fetch('/api/admin/migrate-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Migration successful!')
        setDetails(data)
      } else {
        setStatus('error')
        setMessage(data.error || 'Migration failed')
        setDetails(data)
      }
    } catch (error) {
      setStatus('error')
      setMessage('Failed to run migration')
      setDetails({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const testDatabase = async () => {
    setStatus('loading')
    setMessage('Testing database connection...')
    
    try {
      const response = await fetch('/api/test-db')
      const data = await response.json()
      
      if (response.ok) {
        setStatus('success')
        setMessage('Database connection successful!')
        setDetails(data)
      } else {
        setStatus('error')
        setMessage('Database connection failed')
        setDetails(data)
      }
    } catch (error) {
      setStatus('error')
      setMessage('Failed to test database')
      setDetails({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const testEnvironment = async () => {
    setStatus('loading')
    setMessage('Checking environment variables...')
    
    try {
      const response = await fetch('/api/test-admin')
      const data = await response.json()
      
      if (response.ok) {
        setStatus('success')
        setMessage('Environment variables checked!')
        setDetails(data)
      } else {
        setStatus('error')
        setMessage('Environment check failed')
        setDetails(data)
      }
    } catch (error) {
      setStatus('error')
      setMessage('Failed to check environment')
      setDetails({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Database Setup
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div className="space-y-4">
            <button
              onClick={testEnvironment}
              disabled={status === 'loading'}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              1. Test Environment Variables
            </button>
            
            <button
              onClick={testDatabase}
              disabled={status === 'loading'}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              2. Test Database Connection
            </button>
            
            <button
              onClick={runMigration}
              disabled={status === 'loading'}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              3. Initialize Database Schema & Create Season 2
            </button>
          </div>
          
          {message && (
            <div className={`mt-4 p-4 rounded ${
              status === 'success' ? 'bg-green-100 text-green-800' :
              status === 'error' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              <p className="font-semibold">{message}</p>
              {details && (
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(details, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">⚠️ Important</h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
            This setup page should be removed after initial database setup is complete.
            Run the steps in order: 1) Test Environment, 2) Test Database, 3) Initialize Schema.
          </p>
        </div>
      </div>
    </div>
  )
}