#!/usr/bin/env python3
"""
Player Highlight Generator
===========================

Generates 1-3 highlight positions for each player who played at least 3 games.
Highlights include brilliant moves, blunders, tactical shots, checkmates, etc.

Requirements:
    pip install python-chess stockfish

Usage:
    python scripts/highlights/generate-highlights.py
    python scripts/highlights/generate-highlights.py --depth 10 --limit 5  # Quick test
    python scripts/highlights/generate-highlights.py --depth 15            # Production

Output:
    public/stats/season-2-highlights.json
"""

import sys
import json
import argparse
import os
from pathlib import Path
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Optional

import chess
import chess.pgn

# =============================================================================
# Phase 1: Data Extraction
# =============================================================================

@dataclass
class GameData:
    """Parsed game data with all relevant information."""
    game_index: int
    white: str
    black: str
    result: str
    round_num: str
    date: str
    eco: str
    opening: str
    termination: str
    game_url: str
    moves: list  # List of chess.Move objects
    fens: list   # FEN for each position (including start)
    pgn_text: str  # Original PGN for reference

    @property
    def move_count(self) -> int:
        return len(self.moves)

    @property
    def is_checkmate(self) -> bool:
        return self.termination == 'mate' or '#' in self.pgn_text


@dataclass
class PlayerData:
    """Aggregated data for a single player across all their games."""
    name: str
    games: list = field(default_factory=list)  # List of (GameData, color) tuples

    @property
    def game_count(self) -> int:
        return len(self.games)

    def add_game(self, game: GameData, color: str):
        self.games.append((game, color))


def parse_pgn_file(pgn_path: str, verbose: bool = False) -> list[GameData]:
    """
    Parse a PGN file and extract all games.

    Args:
        pgn_path: Path to the PGN file
        verbose: Print progress information

    Returns:
        List of GameData objects
    """
    games = []

    with open(pgn_path, 'r') as pgn_file:
        game_index = 0

        while True:
            game = chess.pgn.read_game(pgn_file)
            if game is None:
                break

            # Extract headers
            headers = game.headers
            white = headers.get('White', 'Unknown')
            black = headers.get('Black', 'Unknown')
            result = headers.get('Result', '*')
            round_num = headers.get('Round', '?')
            date = headers.get('Date', '?')
            eco = headers.get('ECO', '?')
            opening = headers.get('Opening', 'Unknown Opening')
            termination = headers.get('Termination', '')
            game_url = headers.get('GameURL', headers.get('Site', ''))

            # Extract moves and generate FENs
            board = game.board()
            moves = list(game.mainline_moves())
            fens = [board.fen()]  # Starting position

            for move in moves:
                board.push(move)
                fens.append(board.fen())

            # Get PGN text
            pgn_text = str(game)

            game_data = GameData(
                game_index=game_index,
                white=white,
                black=black,
                result=result,
                round_num=round_num,
                date=date,
                eco=eco,
                opening=opening,
                termination=termination,
                game_url=game_url,
                moves=moves,
                fens=fens,
                pgn_text=pgn_text
            )

            games.append(game_data)

            if verbose:
                print(f"  Parsed game {game_index + 1}: {white} vs {black} ({len(moves)} moves)", file=sys.stderr)

            game_index += 1

    return games


def group_games_by_player(games: list[GameData]) -> dict[str, PlayerData]:
    """
    Group games by player name.
    Each player appears in games as both white and black.

    Args:
        games: List of parsed games

    Returns:
        Dictionary mapping player names to PlayerData
    """
    players = defaultdict(lambda: None)

    for game in games:
        # Add game for white player
        if players[game.white] is None:
            players[game.white] = PlayerData(name=game.white)
        players[game.white].add_game(game, 'white')

        # Add game for black player
        if players[game.black] is None:
            players[game.black] = PlayerData(name=game.black)
        players[game.black].add_game(game, 'black')

    return dict(players)


def filter_players_by_game_count(players: dict[str, PlayerData], min_games: int = 3) -> dict[str, PlayerData]:
    """
    Filter out players with fewer than min_games.

    Args:
        players: Dictionary of player data
        min_games: Minimum number of games required

    Returns:
        Filtered dictionary
    """
    return {
        name: data
        for name, data in players.items()
        if data.game_count >= min_games
    }


def print_player_summary(players: dict[str, PlayerData]):
    """Print summary of players and their game counts."""
    print(f"\n📊 Player Summary:", file=sys.stderr)
    print(f"   Total players: {len(players)}", file=sys.stderr)

    # Sort by game count descending
    sorted_players = sorted(players.items(), key=lambda x: x[1].game_count, reverse=True)

    print(f"\n   Games per player:", file=sys.stderr)
    for name, data in sorted_players[:10]:  # Show top 10
        print(f"   - {name}: {data.game_count} games", file=sys.stderr)

    if len(sorted_players) > 10:
        print(f"   ... and {len(sorted_players) - 10} more players", file=sys.stderr)


# =============================================================================
# Main Entry Point
# =============================================================================

def main():
    parser = argparse.ArgumentParser(description='Generate player highlights from chess games')
    parser.add_argument('--depth', type=int, default=15, help='Stockfish search depth (default: 15)')
    parser.add_argument('--limit', type=int, default=0, help='Limit to first N players (0 = all)')
    parser.add_argument('--min-games', type=int, default=3, help='Minimum games per player (default: 3)')
    parser.add_argument('--player', type=str, default='', help='Analyze specific player only')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    parser.add_argument('--stockfish-path', type=str, default='/opt/homebrew/bin/stockfish',
                        help='Path to Stockfish binary')
    args = parser.parse_args()

    # Determine paths
    script_dir = Path(__file__).parent
    pgn_path = script_dir / 'all-games.pgn'
    output_dir = script_dir.parent.parent / 'public' / 'stats'
    output_path = output_dir / 'season-2-highlights.json'

    print("🎯 K4 Classical League - Player Highlight Generator\n", file=sys.stderr)
    print(f"⚙️  Settings:", file=sys.stderr)
    print(f"   Stockfish depth: {args.depth}", file=sys.stderr)
    print(f"   Minimum games: {args.min_games}", file=sys.stderr)
    if args.limit > 0:
        print(f"   Player limit: {args.limit}", file=sys.stderr)
    if args.player:
        print(f"   Specific player: {args.player}", file=sys.stderr)
    print(f"   PGN file: {pgn_path}", file=sys.stderr)
    print(f"   Output: {output_path}", file=sys.stderr)

    # ==========================================================================
    # Phase 1: Data Extraction
    # ==========================================================================
    print(f"\n📥 Phase 1: Parsing PGN data...", file=sys.stderr)

    if not pgn_path.exists():
        print(f"❌ Error: PGN file not found: {pgn_path}", file=sys.stderr)
        sys.exit(1)

    games = parse_pgn_file(str(pgn_path), verbose=args.verbose)
    print(f"✅ Parsed {len(games)} games", file=sys.stderr)

    # Count total moves
    total_moves = sum(g.move_count for g in games)
    print(f"   Total moves to analyze: {total_moves}", file=sys.stderr)

    # Group by player
    print(f"\n👥 Grouping games by player...", file=sys.stderr)
    all_players = group_games_by_player(games)
    print(f"   Found {len(all_players)} unique players", file=sys.stderr)

    # Filter by minimum games
    players = filter_players_by_game_count(all_players, args.min_games)
    excluded = len(all_players) - len(players)
    print(f"   Players with {args.min_games}+ games: {len(players)}", file=sys.stderr)
    if excluded > 0:
        print(f"   Excluded (< {args.min_games} games): {excluded}", file=sys.stderr)

    # Filter by specific player if requested
    if args.player:
        matching = {k: v for k, v in players.items() if args.player.lower() in k.lower()}
        if not matching:
            print(f"❌ No player found matching '{args.player}'", file=sys.stderr)
            sys.exit(1)
        players = matching
        print(f"   Filtered to {len(players)} matching player(s)", file=sys.stderr)

    # Limit players if requested
    if args.limit > 0 and len(players) > args.limit:
        players = dict(list(players.items())[:args.limit])
        print(f"   Limited to first {args.limit} players", file=sys.stderr)

    # Print summary
    print_player_summary(players)

    # ==========================================================================
    # Phase 2-5: TODO - Will be implemented next
    # ==========================================================================
    print(f"\n🔬 Phase 2: Stockfish analysis...", file=sys.stderr)
    print(f"   [TODO] Not yet implemented", file=sys.stderr)

    print(f"\n🎯 Phase 3: Pattern detection...", file=sys.stderr)
    print(f"   [TODO] Not yet implemented", file=sys.stderr)

    print(f"\n⭐ Phase 4: Highlight selection...", file=sys.stderr)
    print(f"   [TODO] Not yet implemented", file=sys.stderr)

    print(f"\n💾 Phase 5: Output generation...", file=sys.stderr)
    print(f"   [TODO] Not yet implemented", file=sys.stderr)

    # For now, output a placeholder structure
    output = {
        'generated': None,  # Will be set when complete
        'season': 2,
        'status': 'phase1_complete',
        'playerCount': len(players),
        'totalGames': len(games),
        'totalMoves': total_moves,
        'players': [
            {
                'name': player.name,
                'gamesPlayed': player.game_count,
                'highlights': []  # To be filled in Phase 4-5
            }
            for player in players.values()
        ]
    }

    # Ensure output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save placeholder output
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)

    print(f"\n✅ Phase 1 complete!", file=sys.stderr)
    print(f"   Output saved to: {output_path}", file=sys.stderr)
    print(f"   Ready for Phase 2 implementation", file=sys.stderr)


if __name__ == '__main__':
    main()
