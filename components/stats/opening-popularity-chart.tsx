'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface OpeningPopularityChartProps {
  openings: {
    firstMoves: Record<string, {
      count: number
      percentage: number
      winRate: number
    }>
  }
}

export function OpeningPopularityChart({ openings }: OpeningPopularityChartProps) {
  // Transform data for recharts
  const data = Object.entries(openings.firstMoves)
    .map(([move, stats]) => ({
      move,
      games: stats.count,
      winRate: Math.round(stats.winRate),
      percentage: Math.round(stats.percentage)
    }))
    .sort((a, b) => b.games - a.games) // Sort by popularity

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="move"
            stroke="#9ca3af"
            style={{ fontSize: '14px' }}
          />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#ffffff'
            }}
            labelStyle={{
              color: '#ffffff'
            }}
            itemStyle={{
              color: '#ffffff'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'games') return [value, 'Games']
              if (name === 'winRate') return [`${value}%`, 'Win Rate']
              return [value, name]
            }}
          />
          <Bar dataKey="games" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
