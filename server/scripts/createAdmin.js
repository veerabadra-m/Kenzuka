
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import connectDB from '../config/db.js'
import User from '../models/User.js'

dotenv.config()

const createAdmin = async () => {
  try {
    const name = process.env.ADMIN_NAME
    const email = process.env.ADMIN_EMAIL?.toLowerCase().trim()
    const password = process.env.ADMIN_PASSWORD

    if (!name || !email || !password) {
      throw new Error('Please configure ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env')
    }

    if (password.length < 12) {
      throw new Error('Admin password must contain at least 12 characters.')
    }

    await connectDB()

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      throw new Error('This email already exists. Choose a different admin email.')
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    })

    console.log('\nAdmin account created successfully!')
    console.log('Name:', admin.name)
    console.log('Email:', admin.email)
    console.log('Role:', admin.role)
  } catch (error) {
    console.error('\nAdmin creation failed:', error.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

createAdmin()
