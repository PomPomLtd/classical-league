/**
 * Common Chess Opening Names
 *
 * A simplified database of popular chess openings by move sequence.
 * Matches the first 3-6 moves to identify the opening.
 */

const OPENINGS = {
  // King's Pawn Openings (e4)
  'e4 e5': 'King\'s Pawn Opening',
  'e4 e5 Nf3': 'King\'s Knight Opening',
  'e4 e5 Nf3 Nc6': 'King\'s Pawn Game',
  'e4 e5 Nf3 Nc6 Bb5': 'Ruy Lopez',
  'e4 e5 Nf3 Nc6 Bc4': 'Italian Game',
  'e4 e5 Nf3 Nc6 d4': 'Scotch Game',
  'e4 e5 Nf3 Nc6 Nc3': 'Four Knights Game',
  'e4 e5 Nf3 Nf6': 'Petrov Defense',
  'e4 e5 Nf3 d6': 'Philidor Defense',
  'e4 e5 Nf3 f5': 'Latvian Gambit',
  'e4 e5 f4': 'King\'s Gambit',
  'e4 e5 Nc3': 'Vienna Game',
  'e4 e5 Bc4': 'Bishop\'s Opening',

  // Sicilian Defense
  'e4 c5': 'Sicilian Defense',
  'e4 c5 Nf3': 'Sicilian Defense',
  'e4 c5 Nf3 d6': 'Sicilian Defense: Najdorf Variation',
  'e4 c5 Nf3 Nc6': 'Sicilian Defense: Open',
  'e4 c5 Nf3 e6': 'Sicilian Defense: French Variation',
  'e4 c5 c3': 'Sicilian Defense: Alapin Variation',
  'e4 c5 Nc3': 'Sicilian Defense: Closed',

  // French Defense
  'e4 e6': 'French Defense',
  'e4 e6 d4': 'French Defense',
  'e4 e6 d4 d5': 'French Defense',
  'e4 e6 d4 d5 Nc3': 'French Defense: Classical',
  'e4 e6 d4 d5 Nd2': 'French Defense: Tarrasch',

  // Caro-Kann Defense
  'e4 c6': 'Caro-Kann Defense',
  'e4 c6 d4': 'Caro-Kann Defense',
  'e4 c6 d4 d5': 'Caro-Kann Defense',
  'e4 c6 d4 d5 Nc3': 'Caro-Kann Defense: Classical',
  'e4 c6 d4 d5 Nd2': 'Caro-Kann Defense: Two Knights',

  // Pirc & Modern
  'e4 d6': 'Pirc Defense',
  'e4 g6': 'Modern Defense',

  // Alekhine & Scandinavian
  'e4 Nf6': 'Alekhine Defense',
  'e4 d5': 'Scandinavian Defense',

  // Queen's Pawn Openings (d4)
  'd4 d5': 'Queen\'s Pawn Game',
  'd4 d5 c4': 'Queen\'s Gambit',
  'd4 d5 c4 e6': 'Queen\'s Gambit Declined',
  'd4 d5 c4 c6': 'Queen\'s Gambit: Slav Defense',
  'd4 d5 c4 dxc4': 'Queen\'s Gambit Accepted',
  'd4 d5 Nf3': 'Queen\'s Pawn Game',
  'd4 d5 Nf3 Nf6': 'Queen\'s Pawn Game',
  'd4 d5 Nf3 Nf6 c4': 'Queen\'s Gambit',

  // Indian Defenses
  'd4 Nf6': 'Indian Defense',
  'd4 Nf6 c4': 'Indian Game',
  'd4 Nf6 c4 e6': 'Nimzo-Indian/Queen\'s Indian',
  'd4 Nf6 c4 e6 Nc3': 'Nimzo-Indian Defense',
  'd4 Nf6 c4 g6': 'King\'s Indian Defense',
  'd4 Nf6 c4 g6 Nc3': 'King\'s Indian Defense',
  'd4 Nf6 c4 e6 Nf3': 'Queen\'s Indian Defense',
  'd4 Nf6 Nf3 g6': 'King\'s Indian Defense',
  'd4 Nf6 Nf3 e6': 'Indian Defense',
  'd4 Nf6 Nf3 d5': 'Queen\'s Pawn Game',

  // Dutch Defense
  'd4 f5': 'Dutch Defense',
  'd4 f5 c4': 'Dutch Defense',
  'd4 f5 g3': 'Dutch Defense: Leningrad',

  // Grünfeld
  'd4 Nf6 c4 g6 Nc3 d5': 'Grünfeld Defense',

  // Benoni
  'd4 Nf6 c4 c5': 'Benoni Defense',

  // English Opening
  'c4': 'English Opening',
  'c4 e5': 'English Opening: King\'s English',
  'c4 Nf6': 'English Opening',
  'c4 c5': 'English Opening: Symmetrical',
  'c4 e6': 'English Opening',
  'c4 g6': 'English Opening: King\'s Fianchetto',

  // Réti Opening
  'Nf3': 'Réti Opening',
  'Nf3 d5': 'Réti Opening',
  'Nf3 Nf6': 'Réti Opening',
  'Nf3 d5 c4': 'Réti Opening',
  'Nf3 d5 g3': 'King\'s Indian Attack',

  // Bird's Opening
  'f4': 'Bird\'s Opening',
  'f4 d5': 'Bird\'s Opening',

  // Other Flank Openings
  'b3': 'Larsen\'s Opening',
  'g3': 'King\'s Fianchetto Opening',
  'Nc3': 'Dunst Opening',

  // Unusual/Irregular
  'e3': 'Van\'t Kruijs Opening',
  'd3': 'Mieses Opening',
  'a3': 'Anderssen\'s Opening',
  'h3': 'Clemenz Opening',
  'Na3': 'Sodium Attack',
  'Nh3': 'Amar Opening',
};

/**
 * Find opening name by move sequence
 * @param {string} moveSequence - Space-separated moves in SAN (e.g., "e4 e5 Nf3")
 * @returns {string|null} - Opening name or null if not found
 */
function getOpeningName(moveSequence) {
  // Try exact match first
  if (OPENINGS[moveSequence]) {
    return OPENINGS[moveSequence];
  }

  // Try matching progressively shorter sequences
  const moves = moveSequence.split(' ');
  for (let i = moves.length - 1; i >= 1; i--) {
    const partial = moves.slice(0, i).join(' ');
    if (OPENINGS[partial]) {
      return OPENINGS[partial];
    }
  }

  return null;
}

module.exports = {
  getOpeningName,
  OPENINGS
};
