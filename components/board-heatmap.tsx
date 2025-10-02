'use client'

interface BoardHeatmapProps {
  top5Popular: Array<{
    square: string
    visits: number
  }>
  top5Bloodiest: Array<{
    square: string
    captures: number
  }>
  mode: 'popularity' | 'captures'
}

export function BoardHeatmap({ top5Popular, top5Bloodiest, mode }: BoardHeatmapProps) {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']

  // Create map of square to intensity (0-1)
  const intensityMap = new Map<string, number>()

  if (mode === 'popularity') {
    top5Popular.forEach((sq, idx) => {
      intensityMap.set(sq.square, 1 - (idx * 0.15)) // 100%, 85%, 70%, 55%, 40%
    })
  } else {
    top5Bloodiest.forEach((sq, idx) => {
      intensityMap.set(sq.square, 1 - (idx * 0.15))
    })
  }

  const getSquareColor = (square: string, isLight: boolean) => {
    const intensity = intensityMap.get(square)

    if (!intensity) {
      // Default square colors
      return isLight
        ? 'bg-amber-100 dark:bg-amber-200/20'
        : 'bg-amber-800 dark:bg-amber-900/40'
    }

    if (mode === 'popularity') {
      // Green for popular squares
      if (intensity >= 0.85) return isLight ? 'bg-green-400' : 'bg-green-600'
      if (intensity >= 0.70) return isLight ? 'bg-green-300' : 'bg-green-500'
      if (intensity >= 0.55) return isLight ? 'bg-green-200' : 'bg-green-400'
      if (intensity >= 0.40) return isLight ? 'bg-green-100' : 'bg-green-300'
      return isLight ? 'bg-green-50' : 'bg-green-200'
    } else {
      // Red for bloody squares
      if (intensity >= 0.85) return isLight ? 'bg-red-500' : 'bg-red-700'
      if (intensity >= 0.70) return isLight ? 'bg-red-400' : 'bg-red-600'
      if (intensity >= 0.55) return isLight ? 'bg-red-300' : 'bg-red-500'
      if (intensity >= 0.40) return isLight ? 'bg-red-200' : 'bg-red-400'
      return isLight ? 'bg-red-100' : 'bg-red-300'
    }
  }

  const getSquareData = (square: string) => {
    if (mode === 'popularity') {
      const data = top5Popular.find(s => s.square === square)
      return data ? `${data.visits} visits` : null
    } else {
      const data = top5Bloodiest.find(s => s.square === square)
      return data ? `${data.captures} captures` : null
    }
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <div className={`w-4 h-4 rounded ${mode === 'popularity' ? 'bg-green-600' : 'bg-red-700'}`}></div>
          <span className="text-gray-600 dark:text-gray-400">High {mode === 'popularity' ? 'Activity' : 'Captures'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-4 h-4 rounded ${mode === 'popularity' ? 'bg-green-100' : 'bg-red-100'}`}></div>
          <span className="text-gray-600 dark:text-gray-400">Low {mode === 'popularity' ? 'Activity' : 'Captures'}</span>
        </div>
      </div>

      {/* Board */}
      <div className="inline-block border-4 border-gray-700 dark:border-gray-500 rounded-lg overflow-hidden">
        {ranks.map((rank) => (
          <div key={rank} className="flex">
            {files.map((file) => {
              const square = file + rank
              const isLight = (files.indexOf(file) + ranks.indexOf(rank)) % 2 === 0
              const squareColor = getSquareColor(square, isLight)
              const squareData = getSquareData(square)

              return (
                <div
                  key={square}
                  className={`relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 flex items-center justify-center ${squareColor} transition-all hover:ring-2 hover:ring-indigo-500 group`}
                  title={squareData || square}
                >
                  {/* Square Label */}
                  <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-200 opacity-60 group-hover:opacity-100">
                    {square}
                  </span>

                  {/* Tooltip on hover */}
                  {squareData && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {squareData}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* File labels */}
      <div className="flex pl-0">
        {files.map((file) => (
          <div key={file} className="w-10 sm:w-12 md:w-16 text-center text-sm font-mono font-bold text-gray-600 dark:text-gray-400">
            {file}
          </div>
        ))}
      </div>
    </div>
  )
}
