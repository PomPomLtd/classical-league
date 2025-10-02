interface StatCardProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function StatCard({ title, children, className = '' }: StatCardProps) {
  return (
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  )
}
