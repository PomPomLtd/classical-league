'use client'

import { useState } from 'react'
import { Leaderboards } from '@/app/stats/overview/types'
import { StatCard } from '../stat-card'
import { PlayerName } from '../player-name'

interface LeaderboardsSectionProps {
  leaderboards: Leaderboards
}

type LeaderboardTab = 'awards' | 'acpl' | 'improved' | 'consistent' | 'wins' | 'blunders'

export function LeaderboardsSection({ leaderboards }: LeaderboardsSectionProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('awards')

  const tabs: { key: LeaderboardTab; label: string; emoji: string }[] = [
    { key: 'awards', label: 'Most Awards', emoji: '🏆' },
    { key: 'acpl', label: 'Best ACPL', emoji: '⭐' },
    { key: 'improved', label: 'Most Improved', emoji: '📈' },
    { key: 'consistent', label: 'Most Consistent', emoji: '🎯' },
    { key: 'wins', label: 'Win Rate', emoji: '🥇' },
    { key: 'blunders', label: 'Clean Play', emoji: '💎' }
  ]

  return (
    <StatCard title="🏅 Leaderboards">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* Most Awards */}
      {activeTab === 'awards' && (
        <div className="space-y-3">
          {leaderboards.mostAwards.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data yet</p>
          ) : (
            leaderboards.mostAwards.slice(0, 10).map((player, index) => (
              <div
                key={player.player}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-gray-400' :
                    index === 2 ? 'text-amber-600' :
                    'text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      <PlayerName name={player.displayName} />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {player.awards.map(a => a.award).join(', ')}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {player.count}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Best Average ACPL */}
      {activeTab === 'acpl' && (
        <div className="space-y-3">
          {leaderboards.bestAverageACPL.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data yet (need 3+ games)</p>
          ) : (
            leaderboards.bestAverageACPL.slice(0, 10).map((player, index) => (
              <div
                key={player.player}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-gray-400' :
                    index === 2 ? 'text-amber-600' :
                    'text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      <PlayerName name={player.displayName} />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {player.gamesPlayed} games played
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {player.acpl}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Most Improved */}
      {activeTab === 'improved' && (
        <div className="space-y-3">
          {leaderboards.mostImproved.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data yet (need games in early & late rounds)</p>
          ) : (
            leaderboards.mostImproved.slice(0, 10).map((player, index) => (
              <div
                key={player.player}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-gray-400' :
                    index === 2 ? 'text-amber-600' :
                    'text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      <PlayerName name={player.displayName} />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {player.earlyACPL} → {player.lateACPL}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    -{player.improvement}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">ACPL improvement</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Most Consistent */}
      {activeTab === 'consistent' && (
        <div className="space-y-3">
          {leaderboards.mostConsistent.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data yet (need 5+ games)</p>
          ) : (
            leaderboards.mostConsistent.slice(0, 10).map((player, index) => (
              <div
                key={player.player}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-gray-400' :
                    index === 2 ? 'text-amber-600' :
                    'text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      <PlayerName name={player.displayName} />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Avg ACPL: {player.averageACPL} • {player.gamesPlayed} games
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {player.variance}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">std dev</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Highest Win Rate */}
      {activeTab === 'wins' && (
        <div className="space-y-3">
          {leaderboards.highestWinRate.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data yet (need 5+ games)</p>
          ) : (
            leaderboards.highestWinRate.slice(0, 10).map((player, index) => (
              <div
                key={player.player}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-gray-400' :
                    index === 2 ? 'text-amber-600' :
                    'text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      <PlayerName name={player.displayName} />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {player.wins}W / {player.gamesPlayed}G
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {player.winRate.toFixed(1)}%
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Clean Play (Fewest Blunders) */}
      {activeTab === 'blunders' && (
        <div className="space-y-3">
          {leaderboards.fewestBlunders.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data yet (need 3+ games)</p>
          ) : (
            leaderboards.fewestBlunders.slice(0, 10).map((player, index) => (
              <div
                key={player.player}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-gray-400' :
                    index === 2 ? 'text-amber-600' :
                    'text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      <PlayerName name={player.displayName} />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {player.blunders} total blunders
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                  {player.blundersPerGame}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </StatCard>
  )
}
