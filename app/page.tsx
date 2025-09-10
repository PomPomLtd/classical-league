import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="py-16">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Classical Chess League
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Welcome to Season 2 of our classical chess tournament. Register, manage your byes, 
            submit results, and connect with fellow players.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/players/register"
            className="group relative bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="text-2xl">👋</div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Register for Season 2
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Join the tournament by registering with your details
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/players"
            className="group relative bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="text-2xl">📞</div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Player Directory
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Find and contact other players via WhatsApp
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/byes"
            className="group relative bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="text-2xl">⏸️</div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Request Bye
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Skip rounds when you can't play
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/results"
            className="group relative bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="text-2xl">🏆</div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Submit Results
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Report your game results with PGN
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/rules"
            className="group relative bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="text-2xl">📋</div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tournament Rules
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Read the complete tournament rules
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/links"
            className="group relative bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="text-2xl">🔗</div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tournament Links
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Pairings and standings on swissystem.org
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Tournament Info */}
        <div className="mt-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Season 2 Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Format</h3>
              <p className="text-gray-600 dark:text-gray-300">Swiss system tournament</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Schedule</h3>
              <p className="text-gray-600 dark:text-gray-300">1 round every 2 weeks</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Start Date</h3>
              <p className="text-gray-600 dark:text-gray-300">September 23rd, 2025</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Rounds</h3>
              <p className="text-gray-600 dark:text-gray-300">7 rounds total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
