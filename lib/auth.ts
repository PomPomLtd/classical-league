import bcrypt from 'bcryptjs'
import { db } from './db'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createInitialAdmin() {
  const adminUsername = process.env.ADMIN_USERNAME
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminUsername || !adminPassword) {
    console.error('ADMIN_USERNAME and ADMIN_PASSWORD must be set in environment variables')
    return
  }

  // Check if admin already exists
  const existingAdmin = await db.admin.findUnique({
    where: { username: adminUsername }
  })

  if (existingAdmin) {
    console.log('Admin user already exists')
    return
  }

  // Create initial admin
  const hashedPassword = await hashPassword(adminPassword)
  
  await db.admin.create({
    data: {
      username: adminUsername,
      passwordHash: hashedPassword,
    }
  })

  console.log('Initial admin user created successfully')
}

export async function validateAdmin(username: string, password: string): Promise<boolean> {
  const startTime = Date.now()

  try {
    const admin = await db.admin.findUnique({
      where: { username }
    })

    const isValid = admin ? await verifyPassword(password, admin.passwordHash) : false

    // Log authentication attempts (don't log passwords!)
    console.log(`Auth attempt: ${username} | Success: ${isValid} | Time: ${Date.now() - startTime}ms | ${new Date().toISOString()}`)

    return isValid
  } catch (error) {
    console.error(`Auth error for ${username}:`, error)
    return false
  }
}