import { getCurrentRound } from '@/lib/season'
import { LinkCard } from '@/components/link-card'
import { TournamentInfoBlock } from '@/components/tournament-info-block'

// Force dynamic rendering to avoid build-time database calls
export const dynamic = 'force-dynamic'

export default async function LinksPage() {
  const currentRound = await getCurrentRound()
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Tournament Links
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            External links for pairings, standings, and tournament management organized by{' '}
            <a 
              href="https://schachklub-k4.ch" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Schachklub Kreis 4
            </a>
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LinkCard
            href="https://swisssystem.org/tournament/dd5ba09cff1b4ca0972936c5d01dae58/rounds"
            external={true}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            iconBgColor="bg-green-600"
            title={currentRound ? `Round ${currentRound.roundNumber} Pairings` : 'Current Round Pairings'}
            description={currentRound 
              ? `Round ${currentRound.roundNumber} matchups (${new Date(currentRound.roundDate).toLocaleDateString('de-CH')})`
              : 'View current round matchups and board assignments'
            }
            hoverColor="green"
          />

          <LinkCard
            href="https://swisssystem.org/tournament/dd5ba09cff1b4ca0972936c5d01dae58/standings"
            external={true}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            iconBgColor="bg-yellow-600"
            title="Tournament Standings"
            description="Current tournament standings and crosstable"
            hoverColor="yellow"
          />

          <LinkCard
            href="https://chat.whatsapp.com/Dc7GHirC7ce6XabpeHDwIs"
            external={true}
            icon={
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            }
            iconBgColor="bg-green-500"
            title="WhatsApp Group"
            description="Join the tournament WhatsApp group for updates and discussions"
            hoverColor="green"
          />

          <LinkCard
            href="https://lichess.org/broadcast/classical-league-season-2/LVSkiDuJ"
            external={true}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
            iconBgColor="bg-indigo-600"
            title="Live Games on Lichess"
            description="Watch live games and analysis on the official Lichess broadcast"
            hoverColor="indigo"
          />

          <LinkCard
            href="https://schachklub-k4.ch/puzzle-book"
            external={true}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            iconBgColor="bg-purple-600"
            title="Season 1 Puzzle Book"
            description="160 pages of chess puzzles and analogue photography. Limited edition of 100 copies available now."
            hoverColor="purple"
          />
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mt-12">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                About External Links
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p>• All pairings and official standings are managed through SwissSystem.org</p>
                <p>• Links will be updated with specific tournament URLs once available</p>
                <p>• Check these links regularly for the latest pairings and results</p>
                <p>• Bookmark the SwissSystem.org tournament page for quick access</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tournament Status */}
        <TournamentInfoBlock
          title="Current Tournament Status"
          items={[
            { label: "Season", value: "2", highlight: true },
            { label: "Start Date", value: "23.9.2025", highlight: true },
            { label: "Total Rounds", value: "7", highlight: true }
          ]}
          columns={3}
        />
      </div>
    </div>
  )
}