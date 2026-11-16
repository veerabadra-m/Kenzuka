import crypto from 'crypto'
import bcrypt from 'bcryptjs'

import User from '../models/User.js'
import AdminPasswordReset from '../models/AdminPasswordReset.js'
import { sendAdminPasswordResetEmail } from '../config/email.js'

const hashValue = (value) =>
  crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(value)
    .digest('hex')

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const genericResponse = {
  success: true,
  message: 'If this email belongs to an admin account, a recovery code will be sent.',
}

// Step 1: Request an admin recovery OTP.
export const requestAdminPasswordReset = async (req, res) => {
  try {
    const { email } = req.body || {}

    if (
      typeof email !== 'string' ||
      email.trim().length > 254 ||
      !isValidEmail(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const admin = await User.findOne({
      email: normalizedEmail,
      role: 'admin',
    })

    // Do not reveal whether an email belongs to an admin.
    if (!admin) {
      return res.status(200).json(genericResponse)
    }

    let resetRecord = await AdminPasswordReset.findOne({
      email: normalizedEmail,
    })

    const now = new Date()

    // Enforce a 60-second resend cooldown.
    if (
      resetRecord &&
      now.getTime() - resetRecord.lastSentAt.getTime() < 60 * 1000
    ) {
      return res.status(200).json(genericResponse)
    }

    const otp = crypto.randomInt(100000, 1000000).toString()

    if (!resetRecord) {
      resetRecord = new AdminPasswordReset({
        email: normalizedEmail,
        lastSentAt: now,
        expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
      })
    }

    resetRecord.otpHash = hashValue(otp)
    resetRecord.attempts = 0
    resetRecord.lastSentAt = now
    resetRecord.expiresAt = new Date(now.getTime() + 10 * 60 * 1000)
    resetRecord.resetTokenHash = ''
    resetRecord.resetTokenExpiresAt = null

    await resetRecord.save()

    try {
      await sendAdminPasswordResetEmail(normalizedEmail, otp)
    } catch (emailError) {
      await AdminPasswordReset.deleteOne({ _id: resetRecord._id })

      console.error('Admin recovery email failed:', emailError.message)

      return res.status(500).json({
        success: false,
        message: 'Unable to send the recovery email. Please try again later.',
      })
    }

    return res.status(200).json(genericResponse)
  } catch (error) {
    console.error('Admin recovery request error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to process the recovery request.',
    })
  }
}

// Step 2: Verify the admin recovery OTP.
export const verifyAdminPasswordResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body || {}

    if (
      typeof email !== 'string' ||
      typeof otp !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email and six-digit code.',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (
      normalizedEmail.length > 254 ||
      !isValidEmail(normalizedEmail) ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email and six-digit code.',
      })
    }

    const resetRecord = await AdminPasswordReset.findOne({
      email: normalizedEmail,
    })

    if (
      !resetRecord ||
      !resetRecord.otpHash ||
      resetRecord.expiresAt.getTime() <= Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Recovery code expired or not found. Please request a new one.',
      })
    }

    if (resetRecord.attempts >= 5) {
      await AdminPasswordReset.deleteOne({ _id: resetRecord._id })

      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new code.',
      })
    }

    const submittedHash = Buffer.from(hashValue(otp))
    const storedHash = Buffer.from(resetRecord.otpHash)

    const isCorrect =
      submittedHash.length === storedHash.length &&
      crypto.timingSafeEqual(submittedHash, storedHash)

    if (!isCorrect) {
      resetRecord.attempts += 1
      await resetRecord.save()

      return res.status(400).json({
        success: false,
        message: 'Incorrect recovery code.',
      })
    }

    // Generate a separate, random, short-lived reset token.
    const resetToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 5 * 60 * 1000)

    resetRecord.otpHash = ''
    resetRecord.attempts = 0
    resetRecord.resetTokenHash = hashValue(resetToken)
    resetRecord.resetTokenExpiresAt = tokenExpiry
    resetRecord.expiresAt = tokenExpiry

    await resetRecord.save()

    return res.status(200).json({
      success: true,
      message: 'Recovery code verified. You can now set a new password.',
      resetToken,
    })
  } catch (error) {
    console.error('Admin recovery verification error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to verify the recovery code.',
    })
  }
}

// Step 3: Set a new admin password.
export const resetAdminPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body || {}

    if (
      typeof email !== 'string' ||
      typeof resetToken !== 'string' ||
      typeof newPassword !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email, reset token and new password.',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (
      !isValidEmail(normalizedEmail) ||
      normalizedEmail.length > 254 ||
      !/^[a-f0-9]{64}$/i.test(resetToken)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password reset request.',
      })
    }

    if (
      newPassword.length < 8 ||
      Buffer.byteLength(newPassword, 'utf8') > 72
    ) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 8 characters and cannot exceed 72 bytes.',
      })
    }

    const resetRecord = await AdminPasswordReset.findOne({
      email: normalizedEmail,
    })

    if (
      !resetRecord ||
      !resetRecord.resetTokenHash ||
      !resetRecord.resetTokenExpiresAt ||
      resetRecord.resetTokenExpiresAt.getTime() <= Date.now()
    ) {
      return res.status(401).json({
        success: false,
        message: 'Password reset session expired. Please start again.',
      })
    }

    const submittedHash = Buffer.from(hashValue(resetToken))
    const storedHash = Buffer.from(resetRecord.resetTokenHash)

    const isValidToken =
      submittedHash.length === storedHash.length &&
      crypto.timingSafeEqual(submittedHash, storedHash)

    if (!isValidToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password reset session.',
      })
    }

    const admin = await User.findOne({
      email: normalizedEmail,
      role: 'admin',
    }).select('+password')

    if (!admin) {
      await AdminPasswordReset.deleteOne({ _id: resetRecord._id })

      return res.status(404).json({
        success: false,
        message: 'Admin account not found.',
      })
    }

    admin.password = await bcrypt.hash(newPassword, 12)
    await admin.save()

    // Consume the reset token so it cannot be reused.
    await AdminPasswordReset.deleteOne({ _id: resetRecord._id })

    return res.status(200).json({
      success: true,
      message: 'Admin password reset successfully. Please log in with your new password.',
    })
  } catch (error) {
    console.error('Admin password reset error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to reset the admin password.',
    })
  }
}
