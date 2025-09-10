export default function RulesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Tournament Rules
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            K4 Classical League Season 2 - Official Rules
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Last updated: September 2025
          </p>
        </div>

        {/* Rules Content */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 space-y-8">
          
          {/* Tournament Format */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tournament Format</h2>
            <div className="prose dark:prose-invert max-w-none">
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>System:</strong> Swiss system tournament</li>
                <li><strong>Rounds:</strong> 7 rounds total</li>
                <li><strong>Time Control:</strong> 30 minutes + 30 seconds increment per move</li>
                <li><strong>Schedule:</strong> One round every 2 weeks</li>
                <li><strong>Start Date:</strong> 23.9.2025</li>
                <li><strong>Pairings:</strong> Managed via swissystem.org</li>
              </ul>
            </div>
          </section>

          {/* Game Rules */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Game Rules</h2>
            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">Playing Conditions</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>All games must be played online via lichess.org or chess.com</li>
                <li>Both players must agree on the platform before starting</li>
                <li>Time control: exactly 30+30 (30 minutes with 30-second increment)</li>
                <li>Games must be played in rated mode when possible</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">Scheduling</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>Players are responsible for arranging their own game times</li>
                <li>Use the Player Directory to contact opponents via WhatsApp</li>
                <li>Games must be completed within 2 weeks of pairing publication</li>
                <li>Default time is Sunday evening of the round week if no agreement is reached</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">Results</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>Winners must submit results via the website within 24 hours</li>
                <li>Include complete PGN notation of the game</li>
                <li>In case of disputes, contact the tournament director immediately</li>
                <li>Screenshots of final position may be requested for verification</li>
              </ul>
            </div>
          </section>

          {/* Bye System */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Bye System</h2>
            <div className="prose dark:prose-invert max-w-none">
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Deadline:</strong> Wednesday at 12:00 noon before each round</li>
                <li><strong>Scoring:</strong> Bye rounds score 0.5 points (half point)</li>
                <li><strong>Limits:</strong> No limit on the number of bye rounds per player</li>
                <li><strong>Request Process:</strong> Submit via website, admin approval required</li>
                <li><strong>Late Requests:</strong> Not accepted after deadline</li>
              </ul>
            </div>
          </section>

          {/* Fair Play */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Fair Play & Conduct</h2>
            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">Prohibited</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>Use of chess engines or analysis software during games</li>
                <li>Receiving assistance from other players or spectators</li>
                <li>Unsportsmanlike conduct or harassment of opponents</li>
                <li>Intentional disconnection or time wasting</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">Expected Behavior</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>Treat all opponents with respect and courtesy</li>
                <li>Play to the best of your ability in all games</li>
                <li>Report technical issues promptly and fairly</li>
                <li>Follow the tournament schedule and deadlines</li>
              </ul>
            </div>
          </section>

          {/* Disputes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Disputes & Appeals</h2>
            <div className="prose dark:prose-invert max-w-none">
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>Contact tournament director immediately for any disputes</li>
                <li>Provide evidence (screenshots, PGN files, timestamps)</li>
                <li>Director's decisions are final</li>
                <li>Repeated violations may result in tournament exclusion</li>
              </ul>
            </div>
          </section>

          {/* Prize Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Prizes & Recognition</h2>
            <div className="prose dark:prose-invert max-w-none">
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>Tournament winner receives recognition and bragging rights</li>
                <li>Final standings published on tournament website</li>
                <li>Most improved player award</li>
                <li>Best sportsmanship recognition</li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Information</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300">
                For questions about rules, disputes, or technical issues, contact the tournament director 
                through the admin contact information provided in player communications.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.18 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Important:</strong> These rules may be updated during the tournament. 
                Players will be notified of any changes via the website and direct communication.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}