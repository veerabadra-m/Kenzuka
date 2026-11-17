import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import User from '../models/User.js'

dotenv.config()

const updateAdminEmail = async () => {
  try {
    const oldEmail = 'veerabhadra5968@gmail.com'
    const newEmail = 'kenzuka.store@gmail.com'

    await connectDB()

    const existingAdmin = await User.findOne({
      email: oldEmail,
      role: 'admin',
    })

    if (!existingAdmin) {
      throw new Error('Existing admin account was not found.')
    }

    const emailInUse = await User.findOne({ email: newEmail })

    if (emailInUse) {
      throw new Error('The new email is already registered to another account.')
    }

    existingAdmin.email = newEmail
    await existingAdmin.save()

    console.log('\nAdmin email updated successfully!')
    console.log('Name:', existingAdmin.name)
    console.log('New email:', existingAdmin.email)
    console.log('Role:', existingAdmin.role)
    console.log('Existing password preserved.')
  } catch (error) {
    console.error('\nEmail update failed:', error.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

updateAdminEmail()