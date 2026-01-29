import { LinkCard } from "@/components/link-card";
import { TournamentInfoBlock } from "@/components/tournament-info-block";
import { getCurrentSeason } from '@/lib/season';
import { db } from '@/lib/db';
import { tournamentConfig } from '@/lib/tournament-config';

// Force dynamic rendering to avoid build-time database calls
export const dynamic = 'force-dynamic'

async function getRoundInfo() {
  const currentSeason = await getCurrentSeason()
  if (!currentSeason) {
    return { currentRound: null, nextRound: null }
  }

  const rounds = await db.round.findMany({
    where: { seasonId: currentSeason.id },
    orderBy: { roundNumber: 'asc' }
  })

  const now = new Date()
  const currentRound = rounds.find((round: typeof rounds[0]) =>
    round.roundDate <= now && round.roundDate >= new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  )
  const nextRound = rounds.find((round: typeof rounds[0]) => round.roundDate > now)

  return { currentRound, nextRound }
}

// Active Season Homepage
function ActiveSeasonHome({ currentRound, nextRound }: { currentRound: Awaited<ReturnType<typeof getRoundInfo>>['currentRound'], nextRound: Awaited<ReturnType<typeof getRoundInfo>>['nextRound'] }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="py-16">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Schachklub Kreis 4 Classical League
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Welcome to Season {tournamentConfig.currentSeasonNumber} of our classical chess tournament organized by{' '}
            <a
              href="https://schachklub-k4.ch"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Schachklub Kreis 4
            </a>. Register, manage your byes, submit results, and connect with fellow players.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <LinkCard
            href="/players/register"
            icon="👋"
            title={`Register for Season ${tournamentConfig.currentSeasonNumber}`}
            description="Join the tournament by registering with your details"
            hoverColor="green"
          />

          <LinkCard
            href="/players"
            icon="📞"
            title="Player Directory"
            description="Find and contact other players via WhatsApp"
            hoverColor="blue"
          />

          <LinkCard
            href="/byes"
            icon="⏸️"
            title="Request Bye"
            description="Skip rounds when you can't play"
            hoverColor="yellow"
          />

          <LinkCard
            href="/submit-result"
            icon="🏆"
            title="Submit Results"
            description="Report your game results with PGN"
            hoverColor="purple"
          />

          <LinkCard
            href="/rules"
            icon="📋"
            title="Tournament Rules"
            description="Read the complete tournament rules"
            hoverColor="blue"
          />

          <LinkCard
            href="/links"
            icon="🔗"
            title="Tournament Links"
            description="Pairings and standings on swissystem.org"
            hoverColor="green"
          />
        </div>

        {/* Tournament Info */}
        <div className="mt-16 space-y-8">
          <TournamentInfoBlock
            title={`Season ${tournamentConfig.currentSeasonNumber} Information`}
            items={[
              { label: "Format", value: "Swiss system tournament" },
              { label: "Schedule", value: "1 round every 2 weeks" },
              { label: "Rounds", value: "7 rounds total" }
            ]}
            columns={2}
          />

          {/* Round Progress & Lichess Link */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Tournament Progress
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Current Round */}
                {currentRound && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                      Current Round
                    </h4>
                    <div className="mt-1">
                      <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                        Round {currentRound.roundNumber}
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        {currentRound.roundDate.toLocaleDateString('de-CH')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Round */}
                {nextRound && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Next Round
                    </h4>
                    <div className="mt-1">
                      <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        Round {nextRound.roundNumber}
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        {nextRound.roundDate.toLocaleDateString('de-CH')}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Bye deadline: {nextRound.byeDeadline.toLocaleDateString('de-CH')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Lichess Broadcast */}
                <a
                  href={tournamentConfig.lichessBroadcastUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-200 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Live Games
                  </h4>
                  <div className="mt-1">
                    <div className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                      Watch on Lichess
                    </div>
                    <div className="text-sm text-indigo-700 dark:text-indigo-300">
                      Live broadcast & analysis
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Season Completed Homepage
function SeasonCompletedHome() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="py-16">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Schachklub Kreis 4 Classical League
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Season {tournamentConfig.currentSeasonNumber} has concluded! Thank you to all participants for an exciting tournament.
            <br />
            Organized by{' '}
            <a
              href="https://schachklub-k4.ch"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Schachklub Kreis 4
            </a>.
          </p>
        </div>

        {/* Season Summary Card */}
        <div className="mt-12 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-8 border border-amber-200 dark:border-amber-800">
          <div className="text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              Season {tournamentConfig.currentSeasonNumber} Complete
            </h2>
            <p className="mt-2 text-amber-700 dark:text-amber-300">
              7 rounds of classical chess over 14 weeks
            </p>
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <LinkCard
            href="/stats/overview"
            icon="📊"
            title="Season Overview"
            description="Hall of Fame, leaderboards, and season statistics"
            hoverColor="purple"
          />

          <LinkCard
            href="/stats"
            icon="📈"
            title="Round Statistics"
            description="Detailed analysis for each round"
            hoverColor="blue"
          />

          <LinkCard
            href="/links"
            icon="🏅"
            title="Final Standings"
            description="View final standings on swissystem.org"
            hoverColor="green"
          />
        </div>

        {/* Lichess Broadcast Archive */}
        <div className="mt-12">
          <a
            href={tournamentConfig.lichessBroadcastUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-center gap-4">
              <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <div>
                <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                  Watch All Games on Lichess
                </h3>
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                  Browse and analyze all games from Season {tournamentConfig.currentSeasonNumber}
                </p>
              </div>
            </div>
          </a>
        </div>

        {/* Season Info */}
        <div className="mt-12">
          <TournamentInfoBlock
            title={`Season ${tournamentConfig.currentSeasonNumber} Summary`}
            items={[
              { label: "Format", value: "Swiss system tournament" },
              { label: "Time Control", value: "30+30 classical" },
              { label: "Duration", value: "September - December 2025" },
              { label: "Rounds Played", value: "7 rounds" }
            ]}
            columns={2}
          />
        </div>

        {/* Stay Tuned */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Stay tuned for Season {tournamentConfig.currentSeasonNumber + 1}!
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  if (tournamentConfig.isSeasonActive) {
    const { currentRound, nextRound } = await getRoundInfo()
    return <ActiveSeasonHome currentRound={currentRound} nextRound={nextRound} />
  }

  return <SeasonCompletedHome />
}
