import Link from 'next/link'
import React from 'react'

interface LinkCardProps {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  external?: boolean
  iconBgColor?: string
  hoverColor?: string
}

export function LinkCard({ 
  href, 
  icon, 
  title, 
  description, 
  external = false,
  iconBgColor,
  hoverColor = 'blue'
}: LinkCardProps) {
  const Component = external ? 'a' : Link
  const externalProps = external ? { 
    target: '_blank', 
    rel: 'noopener noreferrer' 
  } : {}
  
  const hoverColorClasses = {
    blue: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    green: 'group-hover:text-green-600 dark:group-hover:text-green-400',
    yellow: 'group-hover:text-yellow-600 dark:group-hover:text-yellow-400',
    purple: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
  }

  return (
    <Component
      href={href}
      className="group relative bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 rounded-lg hover:shadow-lg hover:ring-gray-900/10 dark:hover:ring-white/20 transition-all duration-200 ease-in-out hover:scale-[1.02]"
      {...externalProps}
    >
      <div className="flex items-center space-x-4">
        {iconBgColor ? (
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
              {icon}
            </div>
          </div>
        ) : (
          <div className="text-2xl flex-shrink-0">{icon}</div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${hoverColorClasses[hoverColor as keyof typeof hoverColorClasses] || hoverColorClasses.blue} transition-colors`}>
            {title}
            {external && (
              <svg className="inline-block w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            )}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </Component>
  )
}