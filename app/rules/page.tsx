import Link from 'next/link'

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
            Everything you need to know for a fun and fair chess tournament! 🏆
          </p>
        </div>

        {/* Quick Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
            <span className="mr-2">⚡</span> Quick Overview (TL;DR)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300 mb-4">
            <div className="space-y-2">
              <p><strong>📅 Schedule:</strong> 7 rounds, every 2 weeks</p>
              <p><strong>⏰ Time control:</strong> 30+30 (30 minutes + 30 sec/move)</p>
              <p><strong>🎯 Format:</strong> Swiss system tournament</p>
              <p><strong>📱 Contact:</strong> WhatsApp for game arrangement</p>
            </div>
            <div className="space-y-2">
              <p><strong>🏅 Scoring:</strong> Win=1pt, Draw=0.5pt, Loss=0pt, Bye=0.5pt</p>
              <p><strong>🏠 Location:</strong> Preferably club (Tuesday nights)</p>
              <p><strong>📝 Results:</strong> Winner reports within 24 hours</p>
              <p><strong>🚪 Byes:</strong> Request before Wednesday noon</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/players/register" 
              className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-800 bg-white hover:bg-blue-50 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-600 dark:hover:bg-blue-900/50 transition-colors"
            >
              🚀 Register for Tournament
            </Link>
            <Link 
              href="/players" 
              className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-800 bg-white hover:bg-blue-50 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-600 dark:hover:bg-blue-900/50 transition-colors"
            >
              👥 View Player Directory
            </Link>
          </div>
        </div>

        {/* Main Rules Content */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-8 space-y-8">
            {/* Tournament Format */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-3 text-2xl">🏆</span> Tournament Format
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Swiss System Tournament</p>
                  <p>Fair pairings that give everyone a chance to play opponents of similar strength!</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">Game Details</p>
                    <ul className="space-y-1 text-sm">
                      <li><strong>Rounds:</strong> 7 total rounds</li>
                      <li><strong>Time Control:</strong> 30 minutes per player, plus 30 seconds per move (30+30)</li>
                      <li><strong>Perfect for:</strong> All skill levels from beginners to experts</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">Scoring System</p>
                    <ul className="space-y-1 text-sm">
                      <li><strong>Win:</strong> 1 point 🥇</li>
                      <li><strong>Draw:</strong> 0.5 points 🤝</li>
                      <li><strong>Loss:</strong> 0 points</li>
                      <li><strong>Bye:</strong> 0.5 points (max 3 per season)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Schedule */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-3 text-2xl">📅</span> Schedule & Timing
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Pairings Released</p>
                      <p>Every Wednesday around noon</p>
                      <p className="text-xs text-gray-500">Check SwissSystem.org</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Game Deadline</p>
                      <p>Following Wednesday morning</p>
                      <p className="text-xs text-gray-500">Two weeks to complete</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Bye Requests</p>
                      <p>Before Wednesday 12:00 noon</p>
                      <p className="text-xs text-gray-500">Contact tournament organizers</p>
                    </div>
                  </div>
                </div>
                <p><strong>Game Arrangement:</strong> Players contact each other via WhatsApp to schedule their games. We&apos;ll provide contact lists to make this super easy! 📱</p>
              </div>
            </section>

            {/* Playing the Games */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-3 text-2xl">♟️</span> Playing Your Games
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">Preferred: Over the Board (OTB) 🏠</p>
                  <p>Games should primarily be played in person, ideally at our club on Tuesday nights. Nothing beats the experience of moving real pieces!</p>
                </div>
                
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">Alternative Arrangements ✨</p>
                  <p>Can&apos;t make Tuesday nights? No problem! Both players can agree to meet at any other time and place that works for both.</p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">🖥️ Online Play (When Needed)</p>
                  <p className="text-yellow-700 dark:text-yellow-300">If one player can&apos;t meet in person, you may play online on Lichess. This should be the exception rather than the norm, but we understand life happens!</p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="font-semibold text-red-800 dark:text-red-200 mb-2">🚪 Need a Bye or Want to Withdraw?</p>
                  <p className="text-red-700 dark:text-red-300">Life gets busy! If you can&apos;t play a round or need to drop out, just let our tournament organizers know before Wednesday noon when pairings are released. We&apos;re totally understanding! 😊</p>
                  <div className="mt-3">
                    <Link 
                      href="/byes" 
                      className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-800 bg-white hover:bg-red-50 dark:bg-red-900/30 dark:text-red-200 dark:border-red-600 dark:hover:bg-red-900/50 transition-colors"
                    >
                      Request a Bye →
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Recording Games */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-3 text-2xl">📝</span> Recording Your Game
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">Preferred: Paper Scoresheet 📄</p>
                  <p>Each game should be recorded on a scoresheet provided by the club. Don&apos;t have one? You can download and print your own scoresheet from any chess website.</p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="font-semibold text-blue-800 dark:text-blue-200 mb-2">💻 Digital Alternative</p>
                  <p className="text-blue-700 dark:text-blue-300">No scoresheet available? The game can be recorded on Lichess instead. This should also be an exception, but we&apos;ve got you covered!</p>
                </div>
              </div>
            </section>

            {/* Reporting Results */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-3 text-2xl">🏅</span> Reporting Results
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <p className="font-semibold text-green-800 dark:text-green-200 mb-3">📊 Who Reports the Result?</p>
                  <div className="text-green-700 dark:text-green-300 space-y-2">
                    <p><strong>Winner reports the result</strong> using our handy online form</p>
                    <p><strong>In case of a draw:</strong> The white player should report the result</p>
                    <p><strong>Include the PGN notation</strong> from your game - copy it from Lichess, Chess.com, or your chess app</p>
                    <p className="text-sm mt-3">💡 <em>Our tournament organizers will update the official SwissSystem tournament page with your result</em></p>
                  </div>
                  <div className="mt-4">
                    <Link 
                      href="/results" 
                      className="inline-flex items-center px-4 py-2 border border-green-300 shadow-sm text-sm font-medium rounded-md text-green-800 bg-white hover:bg-green-50 dark:bg-green-900/30 dark:text-green-200 dark:border-green-600 dark:hover:bg-green-900/50 transition-colors"
                    >
                      📝 Submit Game Result →
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Chess Rules */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-3 text-2xl">🎯</span> Basic Chess Rules (FIDE Standard)
              </h2>
              <div className="space-y-6 text-gray-700 dark:text-gray-300">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">Touch-Move Rule ✋</p>
                  <ul className="space-y-2 text-sm list-disc ml-6">
                    <li>If you touch a piece intending to move it, you must move that piece (if it has a legal move)</li>
                    <li>If you touch an opponent&apos;s piece intending to capture it, you must capture it (if it&apos;s a legal move)</li>
                    <li>Want to adjust a piece? Say <strong>&quot;j&apos;adoube&quot;</strong> (I adjust) before touching it</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">Illegal Moves 🚫</p>
                  <ul className="space-y-2 text-sm list-disc ml-6">
                    <li>If you make an illegal move and your opponent notices, you must take it back</li>
                    <li>Make a legal move with the same piece if possible</li>
                    <li>If that&apos;s not possible, make any legal move</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">Check & Checkmate ♔</p>
                    <ul className="space-y-2 text-sm list-disc ml-6">
                      <li>You must get out of check on your next move</li>
                      <li>If your king is checkmated, you lose (obviously!) 😄</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">Clock Handling ⏰</p>
                    <ul className="space-y-2 text-sm list-disc ml-6">
                      <li>Press your clock with the same hand you use to move</li>
                      <li>If your time runs out, you lose (if opponent has mating material)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">Draw Conditions 🤝</p>
                  <ul className="space-y-2 text-sm list-disc ml-6">
                    <li><strong>Stalemate:</strong> No legal moves but king isn&apos;t in check</li>
                    <li><strong>Threefold repetition:</strong> Same position occurs three times</li>
                    <li><strong>50-move rule:</strong> 50 moves without a pawn move or capture</li>
                    <li><strong>Mutual agreement:</strong> Both players agree to a draw</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Conduct and Fair Play */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-3 text-2xl">🤝</span> Conduct & Fair Play
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                  <p className="font-semibold text-purple-800 dark:text-purple-200 mb-3">🌟 Sportsmanship</p>
                  <div className="text-purple-700 dark:text-purple-300 space-y-2">
                    <p>We&apos;re here to have fun and improve our chess! Please conduct yourself with respect and fairness.</p>
                    <p>Remember: we&apos;re all friends here, whether you win, lose, or draw! 😊</p>
                  </div>
                </div>
                
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">🔍 Disputes</p>
                  <p>Got a problem or disagreement? No worries! Report any issues to our tournament organizers, whose decision will be final. We&apos;re here to help resolve things fairly and keep the tournament fun for everyone.</p>
                </div>
              </div>
            </section>

            {/* Agreement */}
            <section>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 text-center">
                <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-200 mb-3">
                  🎉 Let&apos;s Have a Great Tournament!
                </h3>
                <p className="text-indigo-700 dark:text-indigo-300">
                  By participating in this tournament, all players agree to abide by these rules and the decisions of our tournament organizers. 
                  Most importantly: <strong>let&apos;s enjoy a fair, competitive, and friendly tournament!</strong>
                </p>
                <p className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 italic">
                  Questions? Don&apos;t hesitate to ask - we&apos;re all here to help each other improve and have fun! ♟️✨
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}