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
    python analyze-pgn.py --depth 15 --sample 3 < games.pgn > analysis.json

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

def classify_move_quality(cp_loss):
    """Classify move quality based on centipawn loss."""
    if cp_loss < 20:
        return 'excellent' if cp_loss == 0 else 'good'
    elif cp_loss < 50:
        return 'inaccuracies'  # Plural to match dict key
    elif cp_loss < 100:
        return 'mistakes'  # Plural to match dict key
    else:
        return 'blunders'  # Plural to match dict key

def calculate_accuracy(acpl):
    """Calculate accuracy percentage from ACPL."""
    return max(0, min(100, 100 - (acpl / 10)))

def analyze_game(game, stockfish, depth=15, sample_rate=2):
    """Analyze a single game with Stockfish."""

    board = game.board()
    moves = list(game.mainline_moves())

    white_cpl_sum = 0
    black_cpl_sum = 0
    white_move_count = 0
    black_move_count = 0

    white_quality = {'blunders': 0, 'mistakes': 0, 'inaccuracies': 0, 'good': 0, 'excellent': 0}
    black_quality = {'blunders': 0, 'mistakes': 0, 'inaccuracies': 0, 'good': 0, 'excellent': 0}

    biggest_blunder = None
    prev_eval = None

    for move_num, move in enumerate(moves):
        # Sample every Nth move to save time
        if move_num % sample_rate != 0:
            board.push(move)
            continue

        # Get evaluation before move
        stockfish.set_fen_position(board.fen())
        eval_before = stockfish.get_evaluation()

        # Convert to centipawns from white's perspective
        if eval_before['type'] == 'cp':
            cp_before = eval_before['value']
        elif eval_before['type'] == 'mate':
            cp_before = 10000 if eval_before['value'] > 0 else -10000
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
            cp_after = 10000 if eval_after['value'] > 0 else -10000
        else:
            cp_after = 0

        # Calculate centipawn loss
        is_white_move = move_num % 2 == 0

        if is_white_move:
            # For white, loss is decrease from white's perspective
            cp_loss = max(0, cp_before - (-cp_after))  # Flip after since it's black's turn
            white_cpl_sum += cp_loss
            white_move_count += 1

            quality = classify_move_quality(cp_loss)
            white_quality[quality] += 1

            if quality == 'blunder' and (biggest_blunder is None or cp_loss > biggest_blunder['cpLoss']):
                biggest_blunder = {
                    'moveNumber': move_num // 2 + 1,
                    'player': 'white',
                    'cpLoss': cp_loss,
                    'move': board.san(move),
                    'evalBefore': cp_before,
                    'evalAfter': -cp_after
                }
        else:
            # For black, loss is decrease from black's perspective
            cp_loss = max(0, -cp_before - cp_after)
            black_cpl_sum += cp_loss
            black_move_count += 1

            quality = classify_move_quality(cp_loss)
            black_quality[quality] += 1

            if quality == 'blunder' and (biggest_blunder is None or cp_loss > biggest_blunder['cpLoss']):
                biggest_blunder = {
                    'moveNumber': move_num // 2 + 1,
                    'player': 'black',
                    'cpLoss': cp_loss,
                    'move': board.san(move),
                    'evalBefore': -cp_before,
                    'evalAfter': cp_after
                }

    # Calculate ACPL and accuracy
    white_acpl = white_cpl_sum / white_move_count if white_move_count > 0 else 0
    black_acpl = black_cpl_sum / black_move_count if black_move_count > 0 else 0

    return {
        'whiteACPL': round(white_acpl, 1),
        'blackACPL': round(black_acpl, 1),
        'whiteAccuracy': round(calculate_accuracy(white_acpl), 1),
        'blackAccuracy': round(calculate_accuracy(black_acpl), 1),
        'whiteMoveQuality': white_quality,
        'blackMoveQuality': black_quality,
        'biggestBlunder': biggest_blunder
    }

def main():
    parser = argparse.ArgumentParser(description='Analyze chess PGN with Stockfish')
    parser.add_argument('--depth', type=int, default=15, help='Stockfish search depth (default: 15)')
    parser.add_argument('--sample', type=int, default=2, help='Analyze every Nth move (default: 2)')
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

    while True:
        game = chess.pgn.read_game(pgn_io)
        if game is None:
            break

        white = game.headers.get('White', 'Unknown')
        black = game.headers.get('Black', 'Unknown')

        print(f"Analyzing game {game_index + 1}: {white} vs {black}...", file=sys.stderr)

        analysis = analyze_game(game, stockfish, args.depth, args.sample)

        games_analyzed.append({
            'gameIndex': game_index,
            'white': white,
            'black': black,
            **analysis
        })

        game_index += 1

    # Find accuracy king and biggest blunder across all games
    accuracy_king = None
    biggest_blunder = None

    for game_data in games_analyzed:
        # Check white
        if accuracy_king is None or game_data['whiteAccuracy'] > accuracy_king['accuracy']:
            accuracy_king = {
                'player': 'white',
                'accuracy': game_data['whiteAccuracy'],
                'acpl': game_data['whiteACPL'],
                'white': game_data['white'],
                'black': game_data['black'],
                'gameIndex': game_data['gameIndex']
            }

        # Check black
        if accuracy_king is None or game_data['blackAccuracy'] > accuracy_king['accuracy']:
            accuracy_king = {
                'player': 'black',
                'accuracy': game_data['blackAccuracy'],
                'acpl': game_data['blackACPL'],
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

    # Output JSON
    output = {
        'games': games_analyzed,
        'summary': {
            'accuracyKing': accuracy_king,
            'biggestBlunder': biggest_blunder
        }
    }

    print(json.dumps(output, indent=2))

if __name__ == '__main__':
    main()
