import { z } from 'zod'

export const playerRegistrationSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-ZäöüÄÖÜß\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(20, 'Phone number must be less than 20 characters')
    .regex(/^\+[\d\s()-]+$/, 'Phone number must start with country code (+41, +49, etc.) and contain only numbers, spaces, hyphens, and parentheses'),
  
  nickname: z.string()
    .min(2, 'Chess Player Name must be at least 2 characters')
    .max(50, 'Chess Player Name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9äöüÄÖÜß\s'"_-]+$/, 'Chess Player Name can only contain letters, numbers, spaces, quotes, underscores, and hyphens'),
  
  lichessRating: z.string()
    .regex(/^\d{3,4}$/, 'Rating must be a number between 100 and 3000')
    .refine(val => {
      const rating = parseInt(val)
      return rating >= 100 && rating <= 3000
    }, 'Rating must be between 100 and 3000'),
  
  rulesAccepted: z.boolean()
    .refine(val => val === true, 'You must accept the tournament rules to register')
})

export type PlayerRegistrationData = z.infer<typeof playerRegistrationSchema>

// Game Result Submission Schema
const GameResultEnum = z.enum(['WHITE_WIN', 'BLACK_WIN', 'DRAW', 'WHITE_WIN_FF', 'BLACK_WIN_FF', 'DOUBLE_FF', 'DRAW_FF'])

export const gameResultSubmissionSchema = z.object({
  roundId: z.string().cuid('Invalid round ID'),
  boardNumber: z.number()
    .int('Board number must be an integer')
    .min(1, 'Board number must be at least 1')
    .max(100, 'Board number must be 100 or less'),
  result: GameResultEnum,
  whitePlayerId: z.string().cuid('Invalid white player ID'),
  blackPlayerId: z.string().cuid('Invalid black player ID'),
  winningPlayerId: z.union([z.string().cuid(), z.null()]).optional(),
  pgn: z.string().optional(),
  forfeitReason: z.string().optional()
}).superRefine((data, ctx) => {
  const forfeitResults = ['WHITE_WIN_FF', 'BLACK_WIN_FF', 'DOUBLE_FF', 'DRAW_FF']
  const isForfeit = forfeitResults.includes(data.result)
  const requiresWinner = !['DRAW', 'DOUBLE_FF', 'DRAW_FF'].includes(data.result)

  // Validate that white and black players are different
  if (data.whitePlayerId === data.blackPlayerId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'White and Black players must be different',
      path: ['blackPlayerId']
    })
  }

  // Validate winning player requirement and that winner is one of the players
  if (requiresWinner && !data.winningPlayerId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Winning player is required for this result type',
      path: ['winningPlayerId']
    })
  }

  // Ensure winning player is either white or black player
  if (data.winningPlayerId &&
      data.winningPlayerId !== data.whitePlayerId &&
      data.winningPlayerId !== data.blackPlayerId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Winning player must be either the white or black player',
      path: ['winningPlayerId']
    })
  }

  // Conditional validation for PGN vs Forfeit Reason
  if (isForfeit) {
    // Forfeit games require forfeit reason, not PGN
    if (!data.forfeitReason || data.forfeitReason.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Forfeit reason is required for forfeit results',
        path: ['forfeitReason']
      })
    }
    
    if (data.forfeitReason && data.forfeitReason.length > 500) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Forfeit reason must be 500 characters or less',
        path: ['forfeitReason']
      })
    }
  } else {
    // Regular games require PGN, not forfeit reason
    if (!data.pgn || data.pgn.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'PGN notation is required for regular games',
        path: ['pgn']
      })
    }

    // Basic PGN validation
    if (data.pgn) {
      const cleaned = data.pgn.trim()
      const hasGameEnd = /1-0|0-1|1\/2-1\/2|\*/.test(cleaned)
      const hasMoves = /\d+\./.test(cleaned)
      
      if (!hasGameEnd && !hasMoves && cleaned.length <= 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please provide valid PGN notation',
          path: ['pgn']
        })
      }
    }
  }
})

export type GameResultSubmissionData = z.infer<typeof gameResultSubmissionSchema>