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
from typing import Optional, List

import chess
import chess.pgn
from stockfish import Stockfish

# =============================================================================
# Phase 2: Stockfish Analysis - Data Classes
# =============================================================================

@dataclass
class MoveAnalysis:
    """Analysis of a single move."""
    move_number: int          # Full move number (1, 2, 3...)
    ply: int                  # Half-move number (0, 1, 2...)
    move_san: str             # Move in SAN notation (e.g., "Nxe5")
    move_uci: str             # Move in UCI notation (e.g., "g1e5")
    color: str                # 'white' or 'black'
    fen_before: str           # Position before move
    fen_after: str            # Position after move
    eval_before: int          # Centipawn eval before (from white's perspective)
    eval_after: int           # Centipawn eval after
    eval_type_before: str     # 'cp' or 'mate'
    eval_type_after: str
    mate_in_before: Optional[int] = None  # Mate in N (if applicable)
    mate_in_after: Optional[int] = None
    best_move: Optional[str] = None  # Engine's best move (UCI)
    best_move_san: Optional[str] = None  # Engine's best move (SAN)
    cp_loss: int = 0          # Centipawn loss for this move
    win_pct_before: float = 50.0  # Win percentage before
    win_pct_after: float = 50.0   # Win percentage after
    win_pct_loss: float = 0.0     # Win percentage lost
    classification: str = 'good'  # excellent, good, inaccuracy, mistake, blunder
    is_capture: bool = False
    is_check: bool = False
    captured_piece: Optional[str] = None


@dataclass
class HighlightCandidate:
    """A potential highlight position."""
    type: str                 # brilliant_move, blunder, checkmate, fork, etc.
    priority: int             # Lower = higher priority (tier 1-5)
    score: float              # Computed score for ranking
    fen: str                  # Position FEN
    move: str                 # Move played (SAN)
    move_uci: str             # Move played (UCI)
    best_move: Optional[str]  # Best move if different
    eval_before: str          # Evaluation before (formatted)
    eval_after: str           # Evaluation after (formatted)
    description: str          # Human-readable description
    move_number: int
    game_index: int
    color: str                # 'white' or 'black'
    # Additional context
    cp_loss: int = 0
    win_pct_loss: float = 0.0
    is_sacrifice: bool = False
    pattern_details: Optional[dict] = None


@dataclass
class GameAnalysis:
    """Complete analysis of a game."""
    game_index: int
    white: str
    black: str
    moves: List[MoveAnalysis] = field(default_factory=list)
    highlights: List[HighlightCandidate] = field(default_factory=list)
    # Summary stats
    white_accuracy: float = 0.0
    black_accuracy: float = 0.0
    white_acpl: float = 0.0
    black_acpl: float = 0.0


@dataclass
class PlayerCard:
    """Player statistics card."""
    name: str
    # Game stats
    games_played: int = 0
    games_as_white: int = 0
    games_as_black: int = 0
    wins: int = 0
    losses: int = 0
    draws: int = 0
    win_rate: float = 0.0
    # Move stats
    total_moves: int = 0
    avg_game_length: float = 0.0
    longest_game: Optional[dict] = None
    shortest_game: Optional[dict] = None
    # Accuracy stats
    accuracy_overall: float = 0.0
    accuracy_as_white: float = 0.0
    accuracy_as_black: float = 0.0
    avg_centipawn_loss: float = 0.0
    # Move quality
    excellent_moves: int = 0
    good_moves: int = 0
    inaccuracies: int = 0
    mistakes: int = 0
    blunders: int = 0
    # Opening preferences
    favorite_opening_white: Optional[dict] = None
    favorite_opening_black: Optional[dict] = None
    # Tactical stats
    total_captures: int = 0
    checks_given: int = 0
    checkmates: int = 0
    castled_kingside: int = 0
    castled_queenside: int = 0

    def to_dict(self) -> dict:
        """Convert to JSON-serializable dict."""
        return {
            'gamesPlayed': self.games_played,
            'gamesAsWhite': self.games_as_white,
            'gamesAsBlack': self.games_as_black,
            'wins': self.wins,
            'losses': self.losses,
            'draws': self.draws,
            'winRate': round(self.win_rate, 1),
            'totalMoves': self.total_moves,
            'avgGameLength': round(self.avg_game_length, 1),
            'longestGame': self.longest_game,
            'shortestGame': self.shortest_game,
            'accuracy': {
                'overall': round(self.accuracy_overall, 1),
                'asWhite': round(self.accuracy_as_white, 1),
                'asBlack': round(self.accuracy_as_black, 1)
            },
            'moveQuality': {
                'excellent': self.excellent_moves,
                'good': self.good_moves,
                'inaccuracies': self.inaccuracies,
                'mistakes': self.mistakes,
                'blunders': self.blunders
            },
            'avgCentipawnLoss': round(self.avg_centipawn_loss, 1),
            'favoriteOpening': {
                'white': self.favorite_opening_white,
                'black': self.favorite_opening_black
            },
            'tactics': {
                'totalCaptures': self.total_captures,
                'checksGiven': self.checks_given,
                'checkmates': self.checkmates,
                'castledKingside': self.castled_kingside,
                'castledQueenside': self.castled_queenside
            }
        }


# =============================================================================
# Phase 2: Stockfish Analysis - Helper Functions
# =============================================================================

def cp_to_win_percentage(cp: int) -> float:
    """
    Convert centipawn evaluation to win percentage.
    Based on Lichess formula: https://lichess.org/page/accuracy
    """
    return 50 + 50 * (2 / (1 + pow(10, -abs(cp) / 400)) - 1) * (-1 if cp < 0 else 1)


def classify_move_by_win_pct(win_before: float, win_after: float, is_white: bool) -> tuple[str, float]:
    """
    Classify move quality based on win percentage change.
    Returns: (classification, win_pct_loss)
    """
    if is_white:
        win_loss = win_before - win_after
    else:
        win_loss = (100 - win_before) - (100 - win_after)

    win_loss = max(0, win_loss)

    if win_loss < 2:
        return 'excellent', win_loss
    elif win_loss < 5:
        return 'good', win_loss
    elif win_loss < 10:
        return 'inaccuracy', win_loss
    elif win_loss < 20:
        return 'mistake', win_loss
    else:
        return 'blunder', win_loss


def calculate_accuracy(win_losses: List[float]) -> float:
    """
    Calculate accuracy percentage from list of win percentage losses.
    Based on Lichess formula.
    """
    import math
    if not win_losses:
        return 100.0

    avg_loss = sum(win_losses) / len(win_losses)
    accuracy = 103.1668 * math.exp(-0.04354 * avg_loss) - 3.1669
    return max(0, min(100, accuracy))


def format_eval(cp: int, is_mate: bool, mate_in: Optional[int]) -> str:
    """Format evaluation for display."""
    if is_mate and mate_in is not None:
        return f"M{mate_in}" if mate_in > 0 else f"M{mate_in}"
    else:
        if cp >= 0:
            return f"+{cp/100:.1f}"
        else:
            return f"{cp/100:.1f}"


# =============================================================================
# Phase 2: Stockfish Analysis - Main Analysis Function
# =============================================================================

def analyze_game_with_stockfish(
    game_data: 'GameData',
    stockfish: Stockfish,
    depth: int = 15,
    verbose: bool = False
) -> GameAnalysis:
    """
    Analyze a game with Stockfish engine.

    Args:
        game_data: Parsed game data
        stockfish: Initialized Stockfish engine
        depth: Analysis depth
        verbose: Print progress

    Returns:
        GameAnalysis with move-by-move analysis
    """
    analysis = GameAnalysis(
        game_index=game_data.game_index,
        white=game_data.white,
        black=game_data.black
    )

    if not game_data.moves:
        return analysis

    white_win_losses = []
    black_win_losses = []
    white_cp_losses = []
    black_cp_losses = []

    # Replay the game and analyze each position
    board = chess.Board()

    for ply, move in enumerate(game_data.moves):
        is_white = (ply % 2 == 0)
        move_number = (ply // 2) + 1
        color = 'white' if is_white else 'black'

        # Get SAN before making the move
        move_san = board.san(move)
        fen_before = board.fen()

        # Analyze position BEFORE move
        stockfish.set_fen_position(fen_before)
        eval_before_raw = stockfish.get_evaluation()
        best_move_uci = stockfish.get_best_move()

        # Parse evaluation before
        if eval_before_raw['type'] == 'cp':
            cp_before = eval_before_raw['value']
            mate_before = None
            eval_type_before = 'cp'
        else:  # mate
            mate_before = eval_before_raw['value']
            cp_before = (10000 - abs(mate_before) * 10) * (1 if mate_before > 0 else -1)
            eval_type_before = 'mate'

        # Make the move
        is_capture = board.is_capture(move)
        captured = None
        if is_capture:
            captured_piece = board.piece_at(move.to_square)
            if captured_piece:
                captured = captured_piece.symbol()

        board.push(move)
        fen_after = board.fen()
        is_check = board.is_check()

        # Analyze position AFTER move
        stockfish.set_fen_position(fen_after)
        eval_after_raw = stockfish.get_evaluation()

        # Parse evaluation after
        if eval_after_raw['type'] == 'cp':
            cp_after = eval_after_raw['value']
            mate_after = None
            eval_type_after = 'cp'
        else:  # mate
            mate_after = eval_after_raw['value']
            cp_after = (10000 - abs(mate_after) * 10) * (1 if mate_after > 0 else -1)
            eval_type_after = 'mate'

        # Calculate win percentages
        win_pct_before = cp_to_win_percentage(cp_before)
        win_pct_after = cp_to_win_percentage(cp_after)

        # Classify the move
        classification, win_pct_loss = classify_move_by_win_pct(win_pct_before, win_pct_after, is_white)

        # Calculate centipawn loss
        if is_white:
            cp_loss = max(0, cp_before - cp_after)
        else:
            cp_loss = max(0, cp_after - cp_before)  # Black wants negative eval

        # Track for accuracy calculation
        if is_white:
            white_win_losses.append(win_pct_loss)
            if eval_type_before == 'cp' and eval_type_after == 'cp':
                white_cp_losses.append(cp_loss)
        else:
            black_win_losses.append(win_pct_loss)
            if eval_type_before == 'cp' and eval_type_after == 'cp':
                black_cp_losses.append(cp_loss)

        # Get best move in SAN
        best_move_san = None
        if best_move_uci:
            try:
                temp_board = chess.Board(fen_before)
                best_move_obj = chess.Move.from_uci(best_move_uci)
                best_move_san = temp_board.san(best_move_obj)
            except:
                pass

        # Create move analysis
        move_analysis = MoveAnalysis(
            move_number=move_number,
            ply=ply,
            move_san=move_san,
            move_uci=move.uci(),
            color=color,
            fen_before=fen_before,
            fen_after=fen_after,
            eval_before=cp_before,
            eval_after=cp_after,
            eval_type_before=eval_type_before,
            eval_type_after=eval_type_after,
            mate_in_before=mate_before,
            mate_in_after=mate_after,
            best_move=best_move_uci,
            best_move_san=best_move_san,
            cp_loss=cp_loss,
            win_pct_before=win_pct_before,
            win_pct_after=win_pct_after,
            win_pct_loss=win_pct_loss,
            classification=classification,
            is_capture=is_capture,
            is_check=is_check,
            captured_piece=captured
        )

        analysis.moves.append(move_analysis)

    # Calculate accuracy scores
    analysis.white_accuracy = calculate_accuracy(white_win_losses)
    analysis.black_accuracy = calculate_accuracy(black_win_losses)
    analysis.white_acpl = sum(white_cp_losses) / len(white_cp_losses) if white_cp_losses else 0
    analysis.black_acpl = sum(black_cp_losses) / len(black_cp_losses) if black_cp_losses else 0

    return analysis


def calculate_player_card(
    player_data: 'PlayerData',
    game_analyses: dict[int, 'GameAnalysis']
) -> PlayerCard:
    """
    Calculate player card statistics from games and analysis.

    Args:
        player_data: Player's games data
        game_analyses: Dictionary of game analyses by game index

    Returns:
        PlayerCard with all statistics
    """
    card = PlayerCard(name=player_data.name)

    # Track for aggregation
    white_accuracies = []
    black_accuracies = []
    all_acpls = []
    white_openings = {}
    black_openings = {}
    game_lengths = []

    for game, color in player_data.games:
        is_white = (color == 'white')

        # Game counts
        card.games_played += 1
        if is_white:
            card.games_as_white += 1
        else:
            card.games_as_black += 1

        # Win/Loss/Draw
        result = game.result
        if result == '1-0':
            if is_white:
                card.wins += 1
            else:
                card.losses += 1
        elif result == '0-1':
            if is_white:
                card.losses += 1
            else:
                card.wins += 1
        elif result == '1/2-1/2':
            card.draws += 1

        # Move count for this player (half the moves roughly)
        player_moves = (game.move_count + 1) // 2 if is_white else game.move_count // 2
        card.total_moves += player_moves
        game_lengths.append(player_moves)

        # Longest/shortest game
        opponent = game.black if is_white else game.white
        game_info = {
            'moves': player_moves,
            'opponent': opponent,
            'round': game.round_num,
            'result': result
        }

        if card.longest_game is None or player_moves > card.longest_game['moves']:
            card.longest_game = game_info
        if card.shortest_game is None or (player_moves > 0 and player_moves < card.shortest_game['moves']):
            card.shortest_game = game_info

        # Opening tracking
        if game.opening and game.eco:
            opening_info = {'name': game.opening, 'eco': game.eco}
            if is_white:
                key = game.eco
                if key not in white_openings:
                    white_openings[key] = {'info': opening_info, 'count': 0}
                white_openings[key]['count'] += 1
            else:
                key = game.eco
                if key not in black_openings:
                    black_openings[key] = {'info': opening_info, 'count': 0}
                black_openings[key]['count'] += 1

        # Get analysis if available
        if game.game_index in game_analyses:
            analysis = game_analyses[game.game_index]

            # Accuracy
            if is_white:
                white_accuracies.append(analysis.white_accuracy)
                all_acpls.append(analysis.white_acpl)
            else:
                black_accuracies.append(analysis.black_accuracy)
                all_acpls.append(analysis.black_acpl)

            # Move quality - count player's moves only
            for move in analysis.moves:
                if move.color == color:
                    if move.classification == 'excellent':
                        card.excellent_moves += 1
                    elif move.classification == 'good':
                        card.good_moves += 1
                    elif move.classification == 'inaccuracy':
                        card.inaccuracies += 1
                    elif move.classification == 'mistake':
                        card.mistakes += 1
                    elif move.classification == 'blunder':
                        card.blunders += 1

                    # Tactical stats
                    if move.is_capture:
                        card.total_captures += 1
                    if move.is_check:
                        card.checks_given += 1

            # Check for checkmate (player delivered)
            if game.is_checkmate:
                winner_color = 'white' if result == '1-0' else 'black'
                if winner_color == color:
                    card.checkmates += 1

        # Castling from game data
        for castle in game.fens:
            # Simple castling detection from FEN changes would be complex
            # We'll track it from the special moves in GameData instead
            pass

    # Calculate averages
    if card.games_played > 0:
        card.win_rate = (card.wins / card.games_played) * 100
        card.avg_game_length = sum(game_lengths) / len(game_lengths) if game_lengths else 0

    if white_accuracies or black_accuracies:
        all_accuracies = white_accuracies + black_accuracies
        card.accuracy_overall = sum(all_accuracies) / len(all_accuracies) if all_accuracies else 0
        card.accuracy_as_white = sum(white_accuracies) / len(white_accuracies) if white_accuracies else 0
        card.accuracy_as_black = sum(black_accuracies) / len(black_accuracies) if black_accuracies else 0

    if all_acpls:
        card.avg_centipawn_loss = sum(all_acpls) / len(all_acpls)

    # Favorite openings
    if white_openings:
        best_white = max(white_openings.items(), key=lambda x: x[1]['count'])
        card.favorite_opening_white = {
            'name': best_white[1]['info']['name'],
            'eco': best_white[1]['info']['eco'],
            'count': best_white[1]['count']
        }

    if black_openings:
        best_black = max(black_openings.items(), key=lambda x: x[1]['count'])
        card.favorite_opening_black = {
            'name': best_black[1]['info']['name'],
            'eco': best_black[1]['info']['eco'],
            'count': best_black[1]['count']
        }

    return card


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
    # Phase 2: Stockfish Analysis
    # ==========================================================================
    print(f"\n🔬 Phase 2: Stockfish analysis...", file=sys.stderr)

    # Collect unique games to analyze (avoid analyzing same game twice)
    games_to_analyze = {}
    for player in players.values():
        for game, color in player.games:
            if game.game_index not in games_to_analyze:
                games_to_analyze[game.game_index] = game

    games_list = list(games_to_analyze.values())
    total_moves_to_analyze = sum(g.move_count for g in games_list)

    print(f"   Games to analyze: {len(games_list)}", file=sys.stderr)
    print(f"   Moves to analyze: {total_moves_to_analyze}", file=sys.stderr)

    # Estimate time
    est_seconds = total_moves_to_analyze * 0.3  # ~0.3 sec per move at depth 15
    est_minutes = est_seconds / 60
    print(f"   Estimated time: {est_minutes:.1f} minutes", file=sys.stderr)

    # Initialize Stockfish
    try:
        stockfish = Stockfish(path=args.stockfish_path, depth=args.depth)
        stockfish.set_depth(args.depth)
        print(f"   Stockfish initialized (depth {args.depth})", file=sys.stderr)
    except Exception as e:
        print(f"❌ Error initializing Stockfish: {e}", file=sys.stderr)
        print(f"   Make sure Stockfish is installed: brew install stockfish", file=sys.stderr)
        sys.exit(1)

    # Analyze each game
    game_analyses: dict[int, GameAnalysis] = {}
    print(f"\n   Analyzing games:", file=sys.stderr)

    for i, game in enumerate(games_list):
        # Progress bar
        progress = (i + 1) / len(games_list) * 100
        bar = '█' * int(progress / 5) + '░' * (20 - int(progress / 5))

        # Truncate names for display
        white_short = game.white[:15] + '...' if len(game.white) > 15 else game.white
        black_short = game.black[:15] + '...' if len(game.black) > 15 else game.black

        print(f"\r   [{bar}] {progress:3.0f}% | Game {i+1}/{len(games_list)} | {white_short} vs {black_short}",
              end='', flush=True, file=sys.stderr)

        # Skip games with no moves
        if game.move_count == 0:
            continue

        # Analyze the game
        analysis = analyze_game_with_stockfish(game, stockfish, args.depth, args.verbose)
        game_analyses[game.game_index] = analysis

    print(f"\n\n✅ Stockfish analysis complete!", file=sys.stderr)

    # Print some stats
    total_blunders = 0
    total_mistakes = 0
    total_excellent = 0
    for analysis in game_analyses.values():
        for move in analysis.moves:
            if move.classification == 'blunder':
                total_blunders += 1
            elif move.classification == 'mistake':
                total_mistakes += 1
            elif move.classification == 'excellent':
                total_excellent += 1

    print(f"   Move classifications:", file=sys.stderr)
    print(f"   - Excellent moves: {total_excellent}", file=sys.stderr)
    print(f"   - Mistakes: {total_mistakes}", file=sys.stderr)
    print(f"   - Blunders: {total_blunders}", file=sys.stderr)

    # ==========================================================================
    # Generate Player Cards
    # ==========================================================================
    print(f"\n📇 Generating player cards...", file=sys.stderr)

    player_cards: dict[str, PlayerCard] = {}
    for name, player in players.items():
        card = calculate_player_card(player, game_analyses)
        player_cards[name] = card

    print(f"✅ Generated {len(player_cards)} player cards", file=sys.stderr)

    # Show top accuracy players
    sorted_by_accuracy = sorted(player_cards.values(), key=lambda c: c.accuracy_overall, reverse=True)
    print(f"\n   Top accuracy:", file=sys.stderr)
    for card in sorted_by_accuracy[:3]:
        print(f"   - {card.name}: {card.accuracy_overall:.1f}%", file=sys.stderr)

    # ==========================================================================
    # Phase 3-5: TODO - Will be implemented next
    # ==========================================================================
    print(f"\n🎯 Phase 3: Pattern detection...", file=sys.stderr)
    print(f"   [TODO] Not yet implemented", file=sys.stderr)

    print(f"\n⭐ Phase 4: Highlight selection...", file=sys.stderr)
    print(f"   [TODO] Not yet implemented", file=sys.stderr)

    print(f"\n💾 Phase 5: Output generation...", file=sys.stderr)

    # Build output with player cards
    from datetime import datetime
    output = {
        'generated': datetime.now().isoformat(),
        'season': 2,
        'status': 'phase2_complete',
        'playerCount': len(players),
        'totalGames': len(games),
        'totalMoves': total_moves,
        'analysisStats': {
            'gamesAnalyzed': len(game_analyses),
            'movesAnalyzed': total_moves_to_analyze,
            'excellentMoves': total_excellent,
            'mistakes': total_mistakes,
            'blunders': total_blunders,
            'depth': args.depth
        },
        'players': [
            {
                'name': player.name,
                'card': player_cards[player.name].to_dict(),
                'highlights': []  # To be filled in Phase 4-5
            }
            for player in players.values()
        ]
    }

    # Ensure output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save output
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)

    print(f"\n✅ Phase 2 complete!", file=sys.stderr)
    print(f"   Output saved to: {output_path}", file=sys.stderr)
    print(f"   Ready for Phase 3 implementation", file=sys.stderr)


if __name__ == '__main__':
    main()
