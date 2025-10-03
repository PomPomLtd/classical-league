'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface WinRateChartProps {
  results: {
    whiteWins: number
    blackWins: number
    draws: number
    whiteWinPercentage: number
    blackWinPercentage: number
    drawPercentage: number
  }
}

export function WinRateChart({ results }: WinRateChartProps) {
  const data = [
    { name: 'White Wins', value: results.whiteWins, percentage: results.whiteWinPercentage },
    { name: 'Black Wins', value: results.blackWins, percentage: results.blackWinPercentage },
    { name: 'Draws', value: results.draws, percentage: results.drawPercentage }
  ].filter(item => item.value > 0) // Only show categories with data

  const COLORS = {
    'White Wins': '#f3f4f6', // Light gray for white
    'Black Wins': '#1f2937', // Dark gray for black
    'Draws': '#6b7280'  // Medium gray for draws
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percentage < 5) return null // Don't show label for very small slices

    // Use black text for white section, white text for others
    const textColor = name === 'White Wins' ? '#000000' : '#ffffff'

    return (
      <text
        x={x}
        y={y}
        fill={textColor}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-semibold text-sm"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
            ))}
          </Pie>
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: number, name: string, props: any) => [
              `${value} games (${props.payload.percentage.toFixed(1)}%)`,
              name
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => {
              const item = data.find(d => d.name === value)
              return `${value}: ${item?.value} (${item?.percentage.toFixed(1)}%)`
            }}
            wrapperStyle={{ fontSize: '14px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
