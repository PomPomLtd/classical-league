import Link from 'next/link'

// Build timestamp - set at build time
const BUILD_TIMESTAMP = new Date().toISOString()

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} <a 
                href="https://schachklub-k4.ch" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Schachklub Kreis 4
              </a>. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link
                href="/rules"
                className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                Tournament Rules
              </Link>
              <Link
                href="/links"
                className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                Tournament Links
              </Link>
              <Link
                href="/admin"
                className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                  <path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z" clipRule="evenodd" />
                </svg>
                Admin
              </Link>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Contact: <a 
                href="mailto:classical@schachklub-k4.ch" 
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                classical@schachklub-k4.ch
              </a>
            </p>
          </div>
        </div>

        {/* Vercel deployment info */}
        {(process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA) && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
              {process.env.VERCEL_DEPLOYMENT_ID && (
                <span>
                  Deploy: {process.env.VERCEL_DEPLOYMENT_ID.slice(0, 8)}
                </span>
              )}
              {process.env.VERCEL_GIT_COMMIT_SHA && (
                <span>
                  Commit: {process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)}
                </span>
              )}
              <span>
                Built: {BUILD_TIMESTAMP.slice(0, 19).replace('T', ' ')} UTC
              </span>
            </div>
          </div>
        )}
      </div>
    </footer>
  )
}