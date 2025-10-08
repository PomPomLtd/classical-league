#!/usr/bin/env python3
"""
Chess PGN Analysis with Stockfish
==================================

Analyzes chess games from PGN data using Stockfish engine.
Calculates accuracy, ACPL, blunders, mistakes, and inaccuracies.

Requirements:
    pip install python-chess stockfish

Usage:
    python analyze-pgn.py < games.pgn > analysis.json
    python analyze-pgn.py --depth 15 --sample 1 < games.pgn > analysis.json

Output JSON format:
    {
        "games": [
            {
                "gameIndex": 0,
                "white": "Player A",
                "black": "Player B",
                "whiteAccuracy": 85.3,
                "blackAccuracy": 78.2,
                "whiteACPL": 25,
                "blackACPL": 45,
                "whiteMoveQuality": {"blunders": 1, "mistakes": 3, ...},
                "blackMoveQuality": {"blunders": 2, "mistakes": 4, ...},
                "biggestBlunder": {...}
            }
        ],
        "summary": {
            "accuracyKing": {...},
            "biggestBlunder": {...}
        }
    }
"""

import sys
import json
import argparse
import chess
import chess.pgn
from stockfish import Stockfish

def cp_to_win_percentage(cp):
    """
    Convert centipawn evaluation to win percentage.
    Based on Lichess formula: https://lichess.org/page/accuracy
    """
    return 50 + 50 * (2 / (1 + pow(10, -abs(cp) / 400)) - 1) * (-1 if cp < 0 else 1)

def classify_move_by_win_percentage(win_before, win_after, is_white):
    """
    Classify move quality based on win percentage change.
    Based on Lichess algorithm: https://github.com/lichess-org/lila/blob/master/modules/analyse/src/main/AccuracyPercent.scala

    Returns: (quality, win_loss) where quality is 'excellent', 'good', 'inaccuracies', 'mistakes', or 'blunders'
    """
    # Calculate win percentage loss (from player's perspective)
    if is_white:
        win_loss = win_before - win_after
    else:
        # For black, we need to flip the percentages
        win_loss = (100 - win_before) - (100 - win_after)

    # Normalize to 0-100 range
    win_loss = max(0, win_loss)

    # Lichess classification thresholds (based on win% loss)
    if win_loss < 2:
        return 'excellent', win_loss
    elif win_loss < 5:
        return 'good', win_loss
    elif win_loss < 10:
        return 'inaccuracies', win_loss
    elif win_loss < 20:
        return 'mistakes', win_loss
    else:
        # Only count as blunder if the position actually swings significantly
        # Don't count blunders when already completely winning/losing
        if win_before > 10 and win_before < 90:  # Position wasn't already decided
            return 'blunders', win_loss
        else:
            return 'mistakes', win_loss

def calculate_accuracy_from_win_percentage(win_losses):
    """
    Calculate accuracy percentage from list of win percentage losses.
    Based on Lichess formula.
    """
    if not win_losses:
        return 100

    # Lichess formula: 103.1668 * e^(-0.04354 * average_win_loss) - 3.1669
    import math
    avg_loss = sum(win_losses) / len(win_losses)
    accuracy = 103.1668 * math.exp(-0.04354 * avg_loss) - 3.1669

    return max(0, min(100, accuracy))

def analyze_game(game, stockfish, depth=15, sample_rate=1):
    """Analyze a single game with Stockfish using Lichess-style win percentage."""

    board = game.board()
    moves = list(game.mainline_moves())

    white_win_losses = []  # Track win% losses for accuracy calculation
    black_win_losses = []
    white_cp_losses = []  # Track actual centipawn losses for ACPL
    black_cp_losses = []

    white_quality = {'blunders': 0, 'mistakes': 0, 'inaccuracies': 0, 'good': 0, 'excellent': 0}
    black_quality = {'blunders': 0, 'mistakes': 0, 'inaccuracies': 0, 'good': 0, 'excellent': 0}

    biggest_blunder = None
    biggest_comeback = None  # Track biggest eval swing from losing position
    lucky_escape = None  # Track when opponent didn't punish a blunder

    # Track eval history for comeback detection (last 10 evals with type info)
    eval_history = []  # Stores tuples: (cp_value, eval_type, mate_in_value)
    # Track previous move eval to detect missed punishments
    prev_eval = None

    for move_num, move in enumerate(moves):
        is_white_move = move_num % 2 == 0

        # Sample every Nth move FOR EACH PLAYER to save time
        # White moves: 0, 2, 4, 6... -> sample 0, 4, 8...
        # Black moves: 1, 3, 5, 7... -> sample 1, 5, 9...
        move_index_for_player = move_num // 2
        if move_index_for_player % sample_rate != 0:
            board.push(move)
            continue

        # Get SAN notation before making the move
        move_san = board.san(move)

        # Get evaluation before move
        stockfish.set_fen_position(board.fen())
        eval_before = stockfish.get_evaluation()

        # Convert to centipawns from white's perspective
        # Use more granular mate scoring: mate-in-N = 10000 - (N * 10)
        if eval_before['type'] == 'cp':
            cp_before = eval_before['value']
        elif eval_before['type'] == 'mate':
            mate_in = eval_before['value']
            cp_before = (10000 - abs(mate_in) * 10) * (1 if mate_in > 0 else -1)
        else:
            cp_before = 0

        # Make the move
        board.push(move)

        # Get evaluation after move
        stockfish.set_fen_position(board.fen())
        eval_after = stockfish.get_evaluation()

        # Convert to centipawns
        if eval_after['type'] == 'cp':
            cp_after = eval_after['value']
        elif eval_after['type'] == 'mate':
            mate_in = eval_after['value']
            cp_after = (10000 - abs(mate_in) * 10) * (1 if mate_in > 0 else -1)
        else:
            cp_after = 0

        # Convert centipawns to win percentages
        win_before = cp_to_win_percentage(cp_before)
        win_after = cp_to_win_percentage(cp_after)

        if is_white_move:
            # Calculate actual centipawn loss (only if both evals are non-mate)
            # Skip ACPL calculation when mate scores involved (unreliable centipawn comparison)
            if eval_before['type'] == 'cp' and eval_after['type'] == 'cp':
                cp_loss = max(0, cp_before - cp_after)
                white_cp_losses.append(cp_loss)

            # Classify move and track win% loss
            quality, win_loss = classify_move_by_win_percentage(win_before, win_after, True)
            white_quality[quality] += 1
            white_win_losses.append(win_loss)

            # Track biggest blunder
            if quality == 'blunders' and (biggest_blunder is None or win_loss > biggest_blunder.get('winLoss', 0)):
                biggest_blunder = {
                    'moveNumber': move_num // 2 + 1,
                    'player': 'white',
                    'cpLoss': int(cp_loss),
                    'winLoss': win_loss,
                    'move': move_san,
                    'evalBefore': cp_before,
                    'evalAfter': cp_after
                }
        else:
            # Calculate actual centipawn loss (from black's perspective)
            # Skip ACPL calculation when mate scores involved (unreliable centipawn comparison)
            if eval_before['type'] == 'cp' and eval_after['type'] == 'cp':
                cp_loss = max(0, cp_after - cp_before)  # Black wants negative eval
                black_cp_losses.append(cp_loss)

            # Classify move and track win% loss
            quality, win_loss = classify_move_by_win_percentage(win_before, win_after, False)
            black_quality[quality] += 1
            black_win_losses.append(win_loss)

            # Track biggest blunder
            if quality == 'blunders' and (biggest_blunder is None or win_loss > biggest_blunder.get('winLoss', 0)):
                biggest_blunder = {
                    'moveNumber': move_num // 2 + 1,
                    'player': 'black',
                    'cpLoss': int(cp_loss),
                    'winLoss': win_loss,
                    'move': move_san,
                    'evalBefore': cp_before,
                    'evalAfter': cp_after
                }

        # Track lucky escape: opponent didn't punish a position
        # If previous move gave opponent an advantage (> +200cp) but they didn't maintain it
        if prev_eval is not None:
            # White had advantage, black didn't punish (eval went back to neutral/white favor)
            if prev_eval < -200 and cp_after > -50:
                escape_amount = abs(prev_eval) - abs(cp_after)
                if lucky_escape is None or escape_amount > lucky_escape.get('escapeAmount', 0):
                    lucky_escape = {
                        'player': 'white',
                        'escapeAmount': escape_amount,
                        'evalBefore': prev_eval,
                        'evalAfter': cp_after,
                        'moveNumber': move_num // 2 + 1
                    }

            # Black had advantage, white didn't punish (eval went back to neutral/black favor)
            if prev_eval > 200 and cp_after < 50:
                escape_amount = abs(prev_eval) - abs(cp_after)
                if lucky_escape is None or escape_amount > lucky_escape.get('escapeAmount', 0):
                    lucky_escape = {
                        'player': 'black',
                        'escapeAmount': escape_amount,
                        'evalBefore': prev_eval,
                        'evalAfter': cp_after,
                        'moveNumber': move_num // 2 + 1
                    }

        # Update previous eval for next iteration
        prev_eval = cp_after

        # Track eval history and detect comebacks (store last 10 evals with metadata)
        eval_history.append({
            'cp': cp_after,
            'type': eval_after['type'],
            'mate': eval_after.get('value') if eval_after['type'] == 'mate' else None
        })
        if len(eval_history) > 10:
            eval_history.pop(0)

        # Check for comeback: look back at eval history
        # A comeback is when eval swung from losing to winning
        if len(eval_history) >= 5:
            # Extract cp values for min/max calculation
            cp_values = [e['cp'] for e in eval_history]
            min_eval_idx = cp_values.index(min(cp_values))
            max_eval_idx = cp_values.index(max(cp_values))

            min_eval_white = eval_history[min_eval_idx]['cp']
            max_eval_white = eval_history[max_eval_idx]['cp']

            # White comeback: was losing badly (< -300 or getting mated), now winning
            if min_eval_white < -300 and cp_after > 300:
                swing = cp_after - min_eval_white
                # Cap swing at 2000 cp to avoid unrealistic mate-score swings
                swing = min(swing, 2000)

                # Format eval strings (use mate notation if applicable)
                eval_from_str = f"M{eval_history[min_eval_idx]['mate']}" if eval_history[min_eval_idx]['type'] == 'mate' else str(min_eval_white)
                eval_to_str = f"M{eval_after.get('value')}" if eval_after['type'] == 'mate' else str(cp_after)

                if biggest_comeback is None or swing > biggest_comeback.get('swing', 0):
                    biggest_comeback = {
                        'player': 'white',
                        'swing': swing,
                        'evalFrom': eval_from_str,
                        'evalTo': eval_to_str,
                        'evalFromCp': min_eval_white,
                        'evalToCp': cp_after,
                        'moveNumber': move_num // 2 + 1
                    }

            # Black comeback: was losing badly (> +300 or getting mated), now winning
            if max_eval_white > 300 and cp_after < -300:
                swing = max_eval_white - cp_after
                # Cap swing at 2000 cp to avoid unrealistic mate-score swings
                swing = min(swing, 2000)

                # Format eval strings (use mate notation if applicable)
                eval_from_str = f"M{eval_history[max_eval_idx]['mate']}" if eval_history[max_eval_idx]['type'] == 'mate' else str(max_eval_white)
                eval_to_str = f"M{eval_after.get('value')}" if eval_after['type'] == 'mate' else str(cp_after)

                if biggest_comeback is None or swing > biggest_comeback.get('swing', 0):
                    biggest_comeback = {
                        'player': 'black',
                        'swing': swing,
                        'evalFrom': eval_from_str,
                        'evalTo': eval_to_str,
                        'evalFromCp': max_eval_white,
                        'evalToCp': cp_after,
                        'moveNumber': move_num // 2 + 1
                    }

    # Calculate accuracy using Lichess formula (based on win% losses)
    white_accuracy = calculate_accuracy_from_win_percentage(white_win_losses)
    black_accuracy = calculate_accuracy_from_win_percentage(black_win_losses)

    # Calculate ACPL (actual centipawn loss)
    white_acpl = sum(white_cp_losses) / len(white_cp_losses) if white_cp_losses else 0
    black_acpl = sum(black_cp_losses) / len(black_cp_losses) if black_cp_losses else 0

    return {
        'whiteACPL': round(white_acpl, 1),
        'blackACPL': round(black_acpl, 1),
        'whiteAccuracy': round(white_accuracy, 1),
        'blackAccuracy': round(black_accuracy, 1),
        'whiteMoveQuality': white_quality,
        'blackMoveQuality': black_quality,
        'biggestBlunder': biggest_blunder,
        'biggestComeback': biggest_comeback,
        'luckyEscape': lucky_escape
    }

def main():
    parser = argparse.ArgumentParser(description='Analyze chess PGN with Stockfish')
    parser.add_argument('--depth', type=int, default=15, help='Stockfish search depth (default: 15)')
    parser.add_argument('--sample', type=int, default=1, help='Analyze every Nth move (default: 1 = all moves)')
    parser.add_argument('--stockfish-path', type=str, default='/opt/homebrew/bin/stockfish', help='Path to Stockfish binary')
    args = parser.parse_args()

    # Initialize Stockfish
    try:
        stockfish = Stockfish(path=args.stockfish_path, depth=args.depth)
    except Exception as e:
        print(f"Error initializing Stockfish: {e}", file=sys.stderr)
        print("Install Stockfish: brew install stockfish (macOS) or apt-get install stockfish (Linux)", file=sys.stderr)
        sys.exit(1)

    # Read PGN from stdin
    pgn_text = sys.stdin.read()

    # Parse games
    games_analyzed = []
    game_index = 0

    import io
    pgn_io = io.StringIO(pgn_text)

    # First pass: count total games
    total_games = pgn_text.count('[Event ')
    print(f"\n🔬 Stockfish Analysis Starting...", file=sys.stderr)
    print(f"📊 Total games to analyze: {total_games}", file=sys.stderr)
    print(f"⚙️  Depth: {args.depth} | Sample rate: every {args.sample} move(s)", file=sys.stderr)

    # Format estimated time in human-readable form
    min_seconds = total_games * 15
    max_seconds = total_games * 30
    min_minutes = min_seconds // 60
    min_secs = min_seconds % 60
    max_minutes = max_seconds // 60
    max_secs = max_seconds % 60

    if max_minutes > 0:
        time_estimate = f"{min_minutes}:{min_secs:02d}-{max_minutes}:{max_secs:02d} minutes"
    else:
        time_estimate = f"{min_seconds}-{max_seconds} seconds"

    print(f"⏱️  Estimated time: {time_estimate}\n", file=sys.stderr)

    while True:
        game = chess.pgn.read_game(pgn_io)
        if game is None:
            break

        white = game.headers.get('White', 'Unknown')
        black = game.headers.get('Black', 'Unknown')

        # Count moves in this game
        board = game.board()
        move_count = 0
        for _ in game.mainline_moves():
            move_count += 1

        # Print progress with game info (use \r to overwrite line)
        progress_pct = ((game_index + 1) / total_games) * 100
        progress_bar = '█' * int(progress_pct / 5) + '░' * (20 - int(progress_pct / 5))

        # Truncate long names to fit on one line (shorter to avoid wrapping)
        max_name_len = 20
        white_short = white[:max_name_len] + '...' if len(white) > max_name_len else white
        black_short = black[:max_name_len] + '...' if len(black) > max_name_len else black

        # Clear line with spaces, then print progress
        progress_line = f"[{progress_bar}] {progress_pct:3.0f}% | {game_index + 1}/{total_games} | {white_short} vs {black_short}"

        # Skip games with no moves (forfeits, etc.)
        if move_count == 0:
            print(f"\r{progress_line:<100} [SKIPPED - no moves]", end='', flush=True, file=sys.stderr)
            game_index += 1
            continue

        print(f"\r{progress_line:<100}", end='', flush=True, file=sys.stderr)

        analysis = analyze_game(game, stockfish, args.depth, args.sample)

        games_analyzed.append({
            'gameIndex': game_index,
            'white': white,
            'black': black,
            **analysis
        })

        game_index += 1

    print(f"\n\n✅ Analysis complete! Processed {total_games} games\n", file=sys.stderr)

    # Find accuracy king, biggest blunder, ACPL extremes, comeback king, and lucky escape across all games
    accuracy_king = None
    biggest_blunder = None
    comeback_king = None
    lucky_escape = None
    lowest_acpl = None
    highest_acpl = None
    lowest_combined_acpl = None
    highest_combined_acpl = None

    for game_data in games_analyzed:
        # Check white accuracy
        if accuracy_king is None or game_data['whiteAccuracy'] > accuracy_king['accuracy']:
            accuracy_king = {
                'player': 'white',
                'accuracy': game_data['whiteAccuracy'],
                'acpl': game_data['whiteACPL'],
                'white': game_data['white'],
                'black': game_data['black'],
                'gameIndex': game_data['gameIndex']
            }

        # Check black accuracy
        if accuracy_king is None or game_data['blackAccuracy'] > accuracy_king['accuracy']:
            accuracy_king = {
                'player': 'black',
                'accuracy': game_data['blackAccuracy'],
                'acpl': game_data['blackACPL'],
                'white': game_data['white'],
                'black': game_data['black'],
                'gameIndex': game_data['gameIndex']
            }

        # Check white lowest ACPL
        if lowest_acpl is None or game_data['whiteACPL'] < lowest_acpl['acpl']:
            lowest_acpl = {
                'player': 'white',
                'acpl': game_data['whiteACPL'],
                'accuracy': game_data['whiteAccuracy'],
                'white': game_data['white'],
                'black': game_data['black'],
                'gameIndex': game_data['gameIndex']
            }

        # Check black lowest ACPL
        if lowest_acpl is None or game_data['blackACPL'] < lowest_acpl['acpl']:
            lowest_acpl = {
                'player': 'black',
                'acpl': game_data['blackACPL'],
                'accuracy': game_data['blackAccuracy'],
                'white': game_data['white'],
                'black': game_data['black'],
                'gameIndex': game_data['gameIndex']
            }

        # Check white highest ACPL
        if highest_acpl is None or game_data['whiteACPL'] > highest_acpl['acpl']:
            highest_acpl = {
                'player': 'white',
                'acpl': game_data['whiteACPL'],
                'accuracy': game_data['whiteAccuracy'],
                'white': game_data['white'],
                'black': game_data['black'],
                'gameIndex': game_data['gameIndex']
            }

        # Check black highest ACPL
        if highest_acpl is None or game_data['blackACPL'] > highest_acpl['acpl']:
            highest_acpl = {
                'player': 'black',
                'acpl': game_data['blackACPL'],
                'accuracy': game_data['blackAccuracy'],
                'white': game_data['white'],
                'black': game_data['black'],
                'gameIndex': game_data['gameIndex']
            }

        # Check combined ACPL
        combined_acpl = game_data['whiteACPL'] + game_data['blackACPL']

        if lowest_combined_acpl is None or combined_acpl < lowest_combined_acpl['combinedACPL']:
            lowest_combined_acpl = {
                'combinedACPL': combined_acpl,
                'whiteACPL': game_data['whiteACPL'],
                'blackACPL': game_data['blackACPL'],
                'white': game_data['white'],
                'black': game_data['black'],
                'gameIndex': game_data['gameIndex']
            }

        if highest_combined_acpl is None or combined_acpl > highest_combined_acpl['combinedACPL']:
            highest_combined_acpl = {
                'combinedACPL': combined_acpl,
                'whiteACPL': game_data['whiteACPL'],
                'blackACPL': game_data['blackACPL'],
                'white': game_data['white'],
                'black': game_data['black'],
                'gameIndex': game_data['gameIndex']
            }

        # Check biggest blunder
        if game_data['biggestBlunder']:
            if biggest_blunder is None or game_data['biggestBlunder']['cpLoss'] > biggest_blunder['cpLoss']:
                biggest_blunder = {
                    **game_data['biggestBlunder'],
                    'white': game_data['white'],
                    'black': game_data['black'],
                    'gameIndex': game_data['gameIndex']
                }

        # Check biggest comeback
        if game_data['biggestComeback']:
            if comeback_king is None or game_data['biggestComeback']['swing'] > comeback_king.get('swing', 0):
                comeback_king = {
                    **game_data['biggestComeback'],
                    'white': game_data['white'],
                    'black': game_data['black'],
                    'gameIndex': game_data['gameIndex']
                }

        # Check lucky escape
        if game_data['luckyEscape']:
            if lucky_escape is None or game_data['luckyEscape']['escapeAmount'] > lucky_escape.get('escapeAmount', 0):
                lucky_escape = {
                    **game_data['luckyEscape'],
                    'white': game_data['white'],
                    'black': game_data['black'],
                    'gameIndex': game_data['gameIndex']
                }

    # Output JSON
    output = {
        'games': games_analyzed,
        'summary': {
            'accuracyKing': accuracy_king,
            'biggestBlunder': biggest_blunder,
            'comebackKing': comeback_king,
            'luckyEscape': lucky_escape,
            'lowestACPL': lowest_acpl,
            'highestACPL': highest_acpl,
            'lowestCombinedACPL': lowest_combined_acpl,
            'highestCombinedACPL': highest_combined_acpl
        }
    }

    print(json.dumps(output, indent=2))

if __name__ == '__main__':
    main()
