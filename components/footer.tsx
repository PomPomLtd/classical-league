import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Schachklub Kreis 4. All rights reserved.
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
      </div>
    </footer>
  )
}