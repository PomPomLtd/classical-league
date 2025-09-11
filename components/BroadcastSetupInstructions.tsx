'use client'

import { useState } from 'react'

interface BroadcastSetupInstructionsProps {
  rounds: Array<{
    id: string
    roundNumber: number
    pgnUrl: string
    gameCount: number
  }>
  seasonName: string
}

export default function BroadcastSetupInstructions({ 
  rounds, 
  seasonName 
}: BroadcastSetupInstructionsProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedUrl(label)
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">
            Lichess Broadcast Setup Instructions
          </h3>
          
          <div className="mt-4 text-sm text-blue-700 dark:text-blue-300">
            <div className="space-y-6">
              {/* Tournament Setup */}
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  1. Create Tournament (One-time setup)
                </h4>
                <ol className="list-decimal list-inside space-y-1 pl-4">
                  <li>Go to <a href="https://lichess.org/broadcast/new" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900 dark:hover:text-blue-100">lichess.org/broadcast/new</a></li>
                  <li>Tournament name: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{seasonName}</code></li>
                  <li>Add description with tournament details</li>
                  <li>Enable &quot;Automatic leaderboard&quot;</li>
                  <li>Save tournament</li>
                </ol>
              </div>

              {/* Round Setup */}
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  2. Create Rounds and Set Source URLs
                </h4>
                <p className="mb-3">For each round, create a new round in your Lichess tournament and set the Source URL:</p>
                
                <div className="space-y-3">
                  {rounds.map((round) => (
                    <div key={round.id} className="bg-white dark:bg-blue-800/50 rounded-md p-3 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-blue-900 dark:text-blue-100">
                          Round {round.roundNumber}
                        </span>
                        <span className="text-xs text-blue-600 dark:text-blue-300">
                          {round.gameCount} games
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs break-all">
                          {round.pgnUrl}
                        </code>
                        <button
                          onClick={() => copyToClipboard(round.pgnUrl, `round-${round.roundNumber}`)}
                          className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
                        >
                          {copiedUrl === `round-${round.roundNumber}` ? '✓' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* How it works */}
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  3. How it works
                </h4>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Lichess polls each Source URL every few seconds</li>
                  <li>When results are submitted and verified, PGN files update automatically</li>
                  <li>Games appear on your Lichess broadcast in real-time</li>
                  <li>Players and visitors can follow games live on Lichess</li>
                </ul>
              </div>

              {/* Troubleshooting */}
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  4. Troubleshooting
                </h4>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>If games don&apos;t appear, check that Source URLs are correct</li>
                  <li>Ensure game results are verified by admin before they appear</li>
                  <li>PGN updates may take up to 10 seconds to appear on Lichess</li>
                  <li>Test URLs by visiting them directly - you should see valid PGN</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}