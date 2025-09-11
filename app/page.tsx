import { LinkCard } from "@/components/link-card";
import { TournamentInfoBlock } from "@/components/tournament-info-block";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="py-16">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Schachklub Kreis 4 Classical League
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Welcome to Season 2 of our classical chess tournament. Register, manage your byes, 
            submit results, and connect with fellow players.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <LinkCard
            href="/players/register"
            icon="👋"
            title="Register for Season 2"
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
        <div className="mt-16">
          <TournamentInfoBlock
            title="Season 2 Information"
            items={[
              { label: "Format", value: "Swiss system tournament" },
              { label: "Schedule", value: "1 round every 2 weeks" },
              { label: "Start Date", value: "23.9.2025" },
              { label: "Rounds", value: "7 rounds total" }
            ]}
            columns={2}
          />
        </div>
      </div>
    </div>
  );
}
