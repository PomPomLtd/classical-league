// Chess nickname generator - creates NEW unique combinations inspired by Season 1 patterns

const pieceNames = [
  'King', 'Queen', 'Rook', 'Bishop', 'Knight', 'Pawn', 'Castling', 'En Passant'
]

const actions = [
  'Slayer', 'Crusher', 'Destroyer', 'Annihilator', 'Executioner', 'Ravager',
  'Ripper', 'Wrecker', 'Mangler', 'Pulverizer', 'Devastator', 'Obliterator',
  'Carnivore', 'Predator', 'Brutalizer', 'Bombardier', 'Ransacker', 'Ruiner',
  'Bludgeoner', 'Shredder', 'Nailer', 'Blaster', 'Chomper', 'Pummeler',
  'Terminator', 'Dominator', 'Vaporizer', 'Liquidator', 'Eliminator', 'Exterminator',
  'Vanquisher', 'Conqueror', 'Subjugator', 'Mutilator', 'Decimator', 'Harvester'
]

const adjectives = [
  'Supreme', 'Ultimate', 'Legendary', 'Epic', 'Mighty', 'Savage', 'Brutal',
  'Ruthless', 'Merciless', 'Unstoppable', 'Feared', 'Notorious', 'Insane',
  'Demonic', 'Electric', 'Nuclear', 'Atomic', 'Cyber', 'Mega', 'Ultra',
  'Mystic', 'Divine', 'Infernal', 'Quantum', 'Plasma', 'Titanium', 'Diamond',
  'Blazing', 'Frozen', 'Shadow', 'Golden', 'Crystal', 'Volcanic', 'Cosmic'
]

const openings = [
  'Sicilian', 'French', 'Caro-Kann', 'King\'s Indian', 'Queen\'s Gambit',
  'English', 'Ruy Lopez', 'Italian', 'Scandinavian', 'Alekhine\'s',
  'Pirc', 'Modern', 'Grünfeld', 'Nimzo-Indian', 'Benoni', 'Dutch',
  'Bird\'s', 'Réti', 'Catalan', 'Vienna', 'London', 'Trompowsky',
  'Budapest', 'Blackmar', 'Polish', 'Hungarian', 'Norwegian', 'Spanish'
]

const titles = [
  'Grandmaster', 'International Master', 'Master', 'Expert', 'Candidate Master',
  'Champion', 'Legend', 'Prodigy', 'Genius', 'Wizard', 'Sage', 'Oracle',
  'Assassin', 'Warrior', 'Gladiator', 'Titan', 'Overlord', 'Commander'
]

const funnyPhrases = [
  'Definitely Not a Bot',
  'Still Learning Castling',
  'Google En Passant',
  'Lichess or Chess.com',
  'Actually Plays the Bongcloud',
  'Sacrifices Everything',
  'Never Premoves',
  'Always Checks Time',
  'Plays King Forward',
  'Loves Threefold Repetition',
  '50 Move Rule Expert',
  'Stalemate Specialist',
  'Blunder Master',
  'Thinks Hourly',
  'Wins by Timeout',
  'Promotes to Rook',
  'Captures Own Pieces',
  'Underpromotes Everything',
  'Hangs Queen on Move 5',
  'Brilliant Queen Sacrifice',
  'Mouse Slip Expert',
  'Always Takes with Check',
  'Trades Everything Off',
  'Forgot About En Passant',
  'Premoves Into Mate',
  'Runs Out of Time Winning',
  'Flag Falls Every Game',
  'Blunders Checkmate in 1',
  'Only Knows 4 Openings',
  'Resigns in Winning Positions',
  'Plays Hope Chess',
  'Calculates 1 Move Deep',
  'Trust Me I\'m 800 ELO',
  'Plays Random Moves',
  'Hangs Pieces for Fun',
  'Never Sees Tactics',
  'Loves Backward Pawns',
  'Creates Weaknesses Everywhere',
  'Ignores Development',
  'Moves Same Piece Twice',
  'Leaves King in Center',
  'Trades Good Bishop',
  'Weakens King Safety',
  'Creates Doubled Pawns',
  'Loves Isolated Pawns',
  'Always Fianchettoes',
  'Plays f3 Every Game'
]

const numbers = ['3000', '4000', '7000', '8000', '9001', '2024', 'XL', 'Pro', 'Max', 'Plus', 'Turbo', 'Alpha', 'Beta', 'Gamma']

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function generateChessNickname(): string {
  const patterns = [
    // [Piece] [Action]
    () => `${getRandomElement(pieceNames)} ${getRandomElement(actions)}`,
    
    // The [Piece] [Action]
    () => `The ${getRandomElement(pieceNames)} ${getRandomElement(actions)}`,
    
    // [Adjective] [Piece] [Action]
    () => `${getRandomElement(adjectives)} ${getRandomElement(pieceNames)} ${getRandomElement(actions)}`,
    
    // The [Adjective] [Piece] [Action]
    () => `The ${getRandomElement(adjectives)} ${getRandomElement(pieceNames)} ${getRandomElement(actions)}`,
    
    // [Piece][Action][Number]
    () => `${getRandomElement(pieceNames)}${getRandomElement(actions)}${getRandomElement(numbers)}`,
    
    // [Opening] [Action]
    () => `${getRandomElement(openings)} ${getRandomElement(actions)}`,
    
    // The [Opening] [Action]  
    () => `The ${getRandomElement(openings)} ${getRandomElement(actions)}`,
    
    // [Title] of [Piece] [Action]
    () => `${getRandomElement(titles)} of ${getRandomElement(pieceNames)} ${getRandomElement(actions)}`,
    
    // The [Adjective] [Title]
    () => `The ${getRandomElement(adjectives)} ${getRandomElement(titles)}`,
    
    // Funny self-aware phrases
    () => getRandomElement(funnyPhrases),
    
    // [Piece] [Action] [Adjective]
    () => `${getRandomElement(pieceNames)} ${getRandomElement(actions)} ${getRandomElement(adjectives)}`,
    
    // [Opening] [Piece] [Action]
    () => `${getRandomElement(openings)} ${getRandomElement(pieceNames)} ${getRandomElement(actions)}`,
    
    // [Adjective] [Opening] [Title] 
    () => `${getRandomElement(adjectives)} ${getRandomElement(openings)} ${getRandomElement(titles)}`,
    
    // The [Opening] [Title]
    () => `The ${getRandomElement(openings)} ${getRandomElement(titles)}`,

    // [Action] of [Opening]
    () => `${getRandomElement(actions)} of ${getRandomElement(openings)}`,

    // [Piece] [Title] [Number]
    () => `${getRandomElement(pieceNames)} ${getRandomElement(titles)} ${getRandomElement(numbers)}`
  ]
  
  const pattern = getRandomElement(patterns)
  return pattern()
}