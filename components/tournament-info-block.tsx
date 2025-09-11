interface InfoItem {
  label: string
  value: string | number
  highlight?: boolean
}

interface TournamentInfoBlockProps {
  title: string
  items: InfoItem[]
  columns?: 1 | 2 | 3
}

export function TournamentInfoBlock({ title, items, columns = 2 }: TournamentInfoBlockProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3'
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 sm:p-8">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">
        {title}
      </h3>
      <div className={`grid ${gridCols[columns]} gap-4 sm:gap-6`}>
        {items.map((item, index) => (
          <div key={index} className={columns === 3 ? 'text-center' : ''}>
            {item.highlight ? (
              <>
                <div className={`text-2xl font-bold ${
                  item.highlight ? 
                  'text-blue-600 dark:text-blue-400' : 
                  'text-gray-900 dark:text-white'
                }`}>
                  {item.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {item.label}
                </div>
              </>
            ) : (
              <>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {item.label}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {item.value}
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}