'use client'

import { Trends } from '@/app/stats/overview/types'
import { StatCard } from '../stat-card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface TrendsSectionProps {
  trends: Trends
  roundsIncluded: number[]
}

export function TrendsSection({ trends, roundsIncluded }: TrendsSectionProps) {
  // Prepare data for ACPL/Accuracy chart
  const acplAccuracyData = roundsIncluded.map((round, index) => ({
    round: `R${round}`,
    ACPL: trends.averageACPLByRound[index],
    Accuracy: trends.averageAccuracyByRound[index]
  }))

  // Prepare data for opening popularity chart
  const openingData = roundsIncluded.map((round, index) => ({
    round: `R${round}`,
    'e4 %': trends.e4PercentageByRound[index],
    'd4 %': trends.d4PercentageByRound[index]
  }))

  // Prepare data for win rates chart
  const winRateData = roundsIncluded.map((round, index) => ({
    round: `R${round}`,
    'White Win %': trends.whiteWinRateByRound[index],
    'Black Win %': trends.blackWinRateByRound[index],
    'Draw %': trends.drawRateByRound[index]
  }))

  // Prepare data for blunders/mistakes chart
  const errorData = roundsIncluded.map((round, index) => ({
    round: `R${round}`,
    'Blunders/Game': trends.blundersPerGameByRound[index],
    'Mistakes/Game': trends.mistakesPerGameByRound[index]
  }))

  return (
    <StatCard title="📈 Trends & Evolution">
      <div className="space-y-8">

        {/* ACPL & Accuracy Trend */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Game Quality Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={acplAccuracyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
              <XAxis
                dataKey="round"
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                yAxisId="left"
                label={{ value: 'ACPL', angle: -90, position: 'insideLeft' }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: 'Accuracy %', angle: 90, position: 'insideRight' }}
                className="text-gray-600 dark:text-gray-400"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="ACPL"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Accuracy"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Lower ACPL and higher Accuracy indicate improving game quality
          </p>
        </div>

        {/* Opening Popularity */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Opening Popularity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={openingData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
              <XAxis
                dataKey="round"
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }}
                className="text-gray-600 dark:text-gray-400"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <Legend />
              <Bar dataKey="e4 %" fill="#f59e0b" />
              <Bar dataKey="d4 %" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Battle of the openings: e4 vs d4
          </p>
        </div>

        {/* Win Rates */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Win Rate Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={winRateData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
              <XAxis
                dataKey="round"
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                label={{ value: 'Win Rate %', angle: -90, position: 'insideLeft' }}
                className="text-gray-600 dark:text-gray-400"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="White Win %"
                stroke="#94a3b8"
                strokeWidth={2}
                dot={{ fill: '#94a3b8', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Black Win %"
                stroke="#1e293b"
                strokeWidth={2}
                dot={{ fill: '#1e293b', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Draw %"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            White has a statistical advantage, but is it holding?
          </p>
        </div>

        {/* Errors Over Time */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Blunders & Mistakes per Game</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={errorData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
              <XAxis
                dataKey="round"
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                label={{ value: 'Per Game', angle: -90, position: 'insideLeft' }}
                className="text-gray-600 dark:text-gray-400"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Blunders/Game"
                stroke="#dc2626"
                strokeWidth={2}
                dot={{ fill: '#dc2626', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Mistakes/Game"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: '#f97316', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Are players getting sharper as the season progresses?
          </p>
        </div>

      </div>
    </StatCard>
  )
}
