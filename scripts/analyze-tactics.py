#!/usr/bin/env python3
"""
Chess Tactical Analysis
=======================

Analyzes enemy territory invasion and most attacked squares from PGN data.

Requirements:
    pip install python-chess

Usage:
    python analyze-tactics.py < games.pgn > tactics.json
"""

import sys
import json
import chess
import chess.pgn
from typing import Dict, Any


class TacticalAnalyzer:
    """Analyzes a single chess game for enemy territory invasion."""

    def __init__(self, game: chess.pgn.Game):
        self.game = game
        self.board = game.board()

        # Track enemy territory invasion
        # White's enemy territory: ranks 5-8 (indices 4-7)
        # Black's enemy territory: ranks 1-4 (indices 0-3)
        self.white_pieces_in_enemy = set()  # Track unique piece types
        self.black_pieces_in_enemy = set()

        # Track first invasion move number (ply)
        self.white_first_invasion = None
        self.black_first_invasion = None

        # Track most attacked square
        self.most_attacked_square = {
            'square': None,
            'attackers': 0,
            'whiteAttackers': 0,
            'blackAttackers': 0,
            'moveNumber': 0,
            'move': None
        }

        # Track tension (mutual attacks between pieces)
        self.current_tensions = {}  # Map of tension pairs to start move
        self.longest_tension = {
            'moves': 0,
            'squares': None,
            'startMove': 0,
            'endMove': 0
        }

        # Get player names
        self.white = game.headers.get("White", "Unknown")
        self.black = game.headers.get("Black", "Unknown")

    def analyze(self) -> Dict[str, Any]:
        """Run all analysis and return results."""
        moves = list(self.game.mainline_moves())

        for move_num, move in enumerate(moves):
            # Get SAN notation BEFORE pushing the move
            move_san = self.board.san(move)

            # Make the move
            self.board.push(move)

            # Track enemy territory invasion and most attacked square
            self._track_enemy_territory(move_num)
            self._detect_most_attacked_square(move_num, move_san)
            self._track_tension(move_num)

        return self._format_results()

    def _track_enemy_territory(self, move_num: int) -> None:
        """
        Track pieces that enter enemy territory.
        White's enemy territory: ranks 5-8 (indices 4-7)
        Black's enemy territory: ranks 1-4 (indices 0-3)
        """
        for square in chess.SQUARES:
            piece = self.board.piece_at(square)
            if not piece:
                continue

            rank = chess.square_rank(square)
            piece_type = piece.piece_type

            # Check if white piece is in enemy territory (rank >= 4, i.e., 5th rank and above)
            if piece.color == chess.WHITE and rank >= 4:
                piece_id = piece_type
                if piece_id not in self.white_pieces_in_enemy:
                    self.white_pieces_in_enemy.add(piece_id)
                    # Record first invasion if not yet recorded
                    if self.white_first_invasion is None:
                        self.white_first_invasion = move_num + 1

            # Check if black piece is in enemy territory (rank <= 3, i.e., 4th rank and below)
            elif piece.color == chess.BLACK and rank <= 3:
                piece_id = piece_type
                if piece_id not in self.black_pieces_in_enemy:
                    self.black_pieces_in_enemy.add(piece_id)
                    # Record first invasion if not yet recorded
                    if self.black_first_invasion is None:
                        self.black_first_invasion = move_num + 1

    def _detect_most_attacked_square(self, move_num: int, move_san: str) -> None:
        """
        Find the most attacked square in the current position.
        Count attacks from both sides on each square.
        """
        # Check all squares for total attacks
        for square in chess.SQUARES:
            # Count attacks from white and black
            white_attackers = len(list(self.board.attackers(chess.WHITE, square)))
            black_attackers = len(list(self.board.attackers(chess.BLACK, square)))
            total_attackers = white_attackers + black_attackers

            # Update if this is the most attacked square we've seen
            if total_attackers > self.most_attacked_square['attackers']:
                self.most_attacked_square = {
                    'square': chess.square_name(square),
                    'attackers': total_attackers,
                    'whiteAttackers': white_attackers,
                    'blackAttackers': black_attackers,
                    'moveNumber': move_num + 1,
                    'move': move_san
                }

    def _track_tension(self, move_num: int) -> None:
        """
        Track tension: when two pieces mutually attack each other.
        Tension persists as long as both pieces can capture each other.
        """
        # Find all current mutual attacks
        current_mutual_attacks = set()

        for square in chess.SQUARES:
            piece = self.board.piece_at(square)
            if not piece:
                continue

            # Get all squares this piece attacks
            attackers_from_square = self.board.attacks(square)

            for target_square in attackers_from_square:
                target_piece = self.board.piece_at(target_square)
                if not target_piece or target_piece.color == piece.color:
                    continue

                # Check if target piece also attacks this square (mutual attack)
                if self.board.is_attacked_by(target_piece.color, square):
                    # Create a sorted tuple so (a,b) == (b,a)
                    tension_pair = tuple(sorted([chess.square_name(square), chess.square_name(target_square)]))
                    current_mutual_attacks.add(tension_pair)

        # Update ongoing tensions
        new_tensions = {}
        for tension_pair in current_mutual_attacks:
            if tension_pair in self.current_tensions:
                # Tension continues
                new_tensions[tension_pair] = self.current_tensions[tension_pair]
            else:
                # New tension starts
                new_tensions[tension_pair] = move_num + 1

        # Check if any tensions ended and update longest
        for tension_pair, start_move in self.current_tensions.items():
            if tension_pair not in current_mutual_attacks:
                # Tension ended
                duration = move_num + 1 - start_move
                if duration > self.longest_tension['moves']:
                    self.longest_tension = {
                        'moves': duration,
                        'squares': f"{tension_pair[0]}-{tension_pair[1]}",
                        'startMove': start_move,
                        'endMove': move_num + 1
                    }

        self.current_tensions = new_tensions

    def _format_results(self) -> Dict[str, Any]:
        """Format analysis results as JSON-serializable dict."""
        return {
            'white': self.white,
            'black': self.black,
            'enemyTerritory': {
                'whitePiecesInEnemy': len(self.white_pieces_in_enemy),
                'blackPiecesInEnemy': len(self.black_pieces_in_enemy),
                'whiteFirstInvasion': self.white_first_invasion,
                'blackFirstInvasion': self.black_first_invasion
            },
            'mostAttackedSquare': self.most_attacked_square if self.most_attacked_square['square'] else None,
            'longestTension': self.longest_tension if self.longest_tension['moves'] > 0 else None
        }


def analyze_all_games(pgn_data: str) -> Dict[str, Any]:
    """
    Analyze all games in PGN data.

    Args:
        pgn_data: String containing PGN game data

    Returns:
        Dictionary with analysis for all games
    """
    games_data = []
    game_count = 0

    # Parse games
    pgn = chess.pgn.read_game(sys.stdin)

    while pgn is not None:
        game_count += 1
        print(f"🔍 Analyzing game {game_count}...", file=sys.stderr)

        try:
            analyzer = TacticalAnalyzer(pgn)
            game_data = analyzer.analyze()
            game_data['gameIndex'] = game_count - 1
            games_data.append(game_data)

        except Exception as e:
            print(f"⚠️  Error analyzing game {game_count}: {e}", file=sys.stderr)

        # Read next game
        pgn = chess.pgn.read_game(sys.stdin)

    # Calculate summary statistics and chicken awards
    summary = {
        'totalGames': len(games_data),

        # Chicken Award 1: Homebody - Least pieces in enemy territory
        'homebody': max(
            games_data,
            key=lambda g: g['enemyTerritory']['whitePiecesInEnemy'] + g['enemyTerritory']['blackPiecesInEnemy']
        ) if games_data else None,

        # Chicken Award 2: Late Bloomer - Waited longest to invade
        'lateBlocker': None,

        # Award: Most attacked square across all games
        'mostAttackedSquareGame': max(
            games_data,
            key=lambda g: g['mostAttackedSquare']['attackers'] if g['mostAttackedSquare'] else 0
        ) if games_data else None,
    }

    # Find the player (white or black) who waited longest to invade
    latest_invasion = 0
    latest_game = None
    latest_player = None

    for game in games_data:
        white_invasion = game['enemyTerritory']['whiteFirstInvasion']
        black_invasion = game['enemyTerritory']['blackFirstInvasion']

        if white_invasion and white_invasion > latest_invasion:
            latest_invasion = white_invasion
            latest_game = game
            latest_player = 'white'

        if black_invasion and black_invasion > latest_invasion:
            latest_invasion = black_invasion
            latest_game = game
            latest_player = 'black'

    if latest_game:
        summary['lateBloomer'] = {
            'white': latest_game['white'],
            'black': latest_game['black'],
            'player': latest_player,
            'moveNumber': latest_invasion,
            'gameIndex': latest_game['gameIndex']
        }

    # Find the player with FEWEST pieces in enemy territory (homebody)
    # Skip games where neither player invaded (empty games)
    min_invasion = float('inf')
    homebody_game = None
    homebody_player = None

    for game in games_data:
        white_pieces = game['enemyTerritory']['whitePiecesInEnemy']
        black_pieces = game['enemyTerritory']['blackPiecesInEnemy']

        # Skip games where neither player invaded
        if white_pieces == 0 and black_pieces == 0:
            continue

        if white_pieces < min_invasion:
            min_invasion = white_pieces
            homebody_game = game
            homebody_player = 'white'

        if black_pieces < min_invasion:
            min_invasion = black_pieces
            homebody_game = game
            homebody_player = 'black'

    if homebody_game:
        summary['homebody'] = {
            'white': homebody_game['white'],
            'black': homebody_game['black'],
            'player': homebody_player,
            'piecesInEnemy': min_invasion,
            'gameIndex': homebody_game['gameIndex']
        }

    # Find the player who invaded EARLIEST (quick draw)
    earliest_invasion = float('inf')
    earliest_game = None
    earliest_player = None

    for game in games_data:
        white_invasion = game['enemyTerritory']['whiteFirstInvasion']
        black_invasion = game['enemyTerritory']['blackFirstInvasion']

        if white_invasion and white_invasion < earliest_invasion:
            earliest_invasion = white_invasion
            earliest_game = game
            earliest_player = 'white'

        if black_invasion and black_invasion < earliest_invasion:
            earliest_invasion = black_invasion
            earliest_game = game
            earliest_player = 'black'

    if earliest_game:
        summary['quickDraw'] = {
            'white': earliest_game['white'],
            'black': earliest_game['black'],
            'player': earliest_player,
            'moveNumber': earliest_invasion,
            'gameIndex': earliest_game['gameIndex']
        }

    # Find the game with longest tension
    longest_tension_duration = 0
    longest_tension_game = None

    for game in games_data:
        if game.get('longestTension') and game['longestTension']['moves'] > longest_tension_duration:
            longest_tension_duration = game['longestTension']['moves']
            longest_tension_game = game

    if longest_tension_game:
        tension_data = longest_tension_game['longestTension']
        summary['longestTension'] = {
            'white': longest_tension_game['white'],
            'black': longest_tension_game['black'],
            'moves': tension_data['moves'],
            'squares': tension_data['squares'],
            'startMove': tension_data['startMove'],
            'endMove': tension_data['endMove'],
            'gameIndex': longest_tension_game['gameIndex']
        }

    return {
        'games': games_data,
        'summary': summary
    }


def main():
    """Main entry point."""
    print("🎯 Chess Tactical Analysis\n", file=sys.stderr)

    try:
        # Analyze all games from stdin
        results = analyze_all_games(sys.stdin)

        # Output JSON to stdout
        print(json.dumps(results, indent=2))

        # Print summary to stderr
        summary = results['summary']
        print(f"\n✅ Analysis complete!", file=sys.stderr)
        print(f"📊 Games analyzed: {summary['totalGames']}", file=sys.stderr)

        if summary.get('homebody'):
            h = summary['homebody']
            player_name = h['white'] if h['player'] == 'white' else h['black']
            print(f"🏠 Homebody: {player_name} ({h['piecesInEnemy']} pieces in enemy territory)", file=sys.stderr)

        if summary.get('lateBloomer'):
            lb = summary['lateBloomer']
            player_name = lb['white'] if lb['player'] == 'white' else lb['black']
            print(f"🐢 Late Bloomer: {player_name} (first invasion on move {lb['moveNumber']})", file=sys.stderr)

    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
