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
  
  rulesAccepted: z.boolean()
    .refine(val => val === true, 'You must accept the tournament rules to register')
})

export type PlayerRegistrationData = z.infer<typeof playerRegistrationSchema>