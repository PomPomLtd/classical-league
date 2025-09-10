import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(_request: NextRequest) {
  try {
    // Get admin credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminUsername || !adminPassword) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Admin credentials not configured in environment variables'
        },
        { status: 400 }
      )
    }

    // Check if admin already exists
    const existingAdmin = await db.admin.findUnique({
      where: { username: adminUsername }
    })

    if (existingAdmin) {
      return NextResponse.json({ 
        status: 'info',
        message: 'Admin user already exists',
        username: adminUsername
      })
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(adminPassword, 10)

    // Create admin user
    const admin = await db.admin.create({
      data: {
        username: adminUsername,
        passwordHash: passwordHash
      }
    })

    return NextResponse.json({ 
      status: 'success',
      message: 'Admin user created successfully',
      admin: {
        id: admin.id,
        username: admin.username,
        createdAt: admin.createdAt
      }
    })

  } catch (error) {
    console.error('Admin creation error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to create admin user',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}