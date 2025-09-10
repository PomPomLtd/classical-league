import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD
    const nextAuthSecret = process.env.NEXTAUTH_SECRET
    const databaseUrl = process.env.DATABASE_URL
    
    return NextResponse.json({ 
      status: 'success',
      env_check: {
        ADMIN_USERNAME: adminUsername ? `Set (${adminUsername.substring(0, 2)}...)` : 'Not set',
        ADMIN_PASSWORD: adminPassword ? `Set (${adminPassword.length} chars)` : 'Not set', 
        NEXTAUTH_SECRET: nextAuthSecret ? `Set (${nextAuthSecret.length} chars)` : 'Not set',
        DATABASE_URL: databaseUrl ? `Set (${databaseUrl.substring(0, 20)}...)` : 'Not set'
      }
    })
  } catch (error) {
    console.error('Environment test error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Environment test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}