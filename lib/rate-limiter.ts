// Simple in-memory rate limiter for basic protection
// For production use Redis or similar persistent store

interface RateLimitEntry {
  attempts: number
  resetTime: number
  blockedUntil?: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  blockDurationMs: number = 30 * 60 * 1000 // 30 minutes block
): { allowed: boolean; remainingAttempts: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  // Clean up expired entries periodically
  if (Math.random() < 0.1) { // 10% chance to clean up
    cleanupExpiredEntries()
  }

  if (!entry) {
    // First attempt for this key
    rateLimitStore.set(key, {
      attempts: 1,
      resetTime: now + windowMs
    })
    return {
      allowed: true,
      remainingAttempts: maxAttempts - 1,
      resetTime: now + windowMs
    }
  }

  // Check if currently blocked
  if (entry.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: entry.blockedUntil
    }
  }

  // Check if window has expired
  if (now >= entry.resetTime) {
    // Reset the window
    rateLimitStore.set(key, {
      attempts: 1,
      resetTime: now + windowMs
    })
    return {
      allowed: true,
      remainingAttempts: maxAttempts - 1,
      resetTime: now + windowMs
    }
  }

  // Within the window, check attempts
  if (entry.attempts >= maxAttempts) {
    // Block the key
    entry.blockedUntil = now + blockDurationMs
    rateLimitStore.set(key, entry)
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: entry.blockedUntil
    }
  }

  // Increment attempts
  entry.attempts++
  rateLimitStore.set(key, entry)

  return {
    allowed: true,
    remainingAttempts: maxAttempts - entry.attempts,
    resetTime: entry.resetTime
  }
}

function cleanupExpiredEntries() {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetTime && (!entry.blockedUntil || now >= entry.blockedUntil)) {
      rateLimitStore.delete(key)
    }
  }
}

// Get client IP helper
export function getClientIP(request: Request): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip')

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim()
  }

  if (realIP) return realIP
  if (cfIP) return cfIP

  // Fallback - this won't work in production behind a proxy
  return 'unknown'
}