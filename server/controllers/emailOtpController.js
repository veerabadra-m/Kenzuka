
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import User from '../models/User.js'
import EmailOtp from '../models/EmailOtp.js'
import { sendOtpEmail } from '../config/email.js'

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const hashOtp = (otp) =>
  crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(otp)
    .digest('hex')

const generateToken = (userId) =>
  jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )

const getSafeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
})

// Step 1: Start common login.
export const startLogin = async (req, res) => {
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

    const existingUser = await User.findOne({
      email: normalizedEmail,
    })

    // Admin uses the existing password login.
    if (existingUser?.role === 'admin') {
      return res.status(200).json({
        success: true,
        method: 'password',
        message: 'Please enter your admin password.',
      })
    }

    // Customers and new users receive an OTP.
    let otpRecord = await EmailOtp.findOne({
      email: normalizedEmail,
    })

    const now = new Date()

    if (
      otpRecord &&
      now.getTime() - otpRecord.lastSentAt.getTime() < 60 * 1000
    ) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 60 seconds before requesting another OTP.',
      })
    }

    const otp = crypto.randomInt(100000, 1000000).toString()

    if (!otpRecord) {
      otpRecord = new EmailOtp({
        email: normalizedEmail,
      })
    }

    otpRecord.otpHash = hashOtp(otp)
    otpRecord.attempts = 0
    otpRecord.lastSentAt = now
    otpRecord.expiresAt = new Date(now.getTime() + 10 * 60 * 1000)

    await otpRecord.save()

    try {
      await sendOtpEmail(normalizedEmail, otp)
    } catch (emailError) {
      await EmailOtp.deleteOne({ email: normalizedEmail })

      console.error('OTP email delivery failed:', emailError.message)

      return res.status(500).json({
        success: false,
        message: 'Unable to send verification email. Please try again later.',
      })
    }

    return res.status(200).json({
      success: true,
      method: 'otp',
      message: 'Verification code sent to your email.',
    })
  } catch (error) {
    console.error('Start login error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to start login.',
    })
  }
}

// Step 2: Verify OTP exactly once.
export const verifyCustomerOtp = async (req, res) => {
  try {
    const { email, otp } = req.body || {}

    if (
      typeof email !== 'string' ||
      typeof otp !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email and verification code.',
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
        message: 'Please provide a valid email and six-digit OTP.',
      })
    }

    const otpRecord = await EmailOtp.findOne({
      email: normalizedEmail,
    })

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Verification code not found. Please request a new one.',
      })
    }

    if (otpRecord.expiresAt.getTime() <= Date.now()) {
      await EmailOtp.deleteOne({ _id: otpRecord._id })

      return res.status(400).json({
        success: false,
        message: 'Verification code expired. Please request a new one.',
      })
    }

    if (otpRecord.attempts >= 5) {
      await EmailOtp.deleteOne({ _id: otpRecord._id })

      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.',
      })
    }

    const submittedHash = Buffer.from(hashOtp(otp))
    const storedHash = Buffer.from(otpRecord.otpHash)

    const isOtpCorrect =
      submittedHash.length === storedHash.length &&
      crypto.timingSafeEqual(submittedHash, storedHash)

    if (!isOtpCorrect) {
      otpRecord.attempts += 1
      await otpRecord.save()

      return res.status(400).json({
        success: false,
        message: 'Incorrect verification code.',
      })
    }

    // Consume the OTP immediately after successful verification.
    await EmailOtp.deleteOne({ _id: otpRecord._id })

    const existingUser = await User.findOne({
      email: normalizedEmail,
    })

    // Admin must always use password login.
    if (existingUser?.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Please use your admin password to sign in.',
      })
    }

    // Existing customer logs in immediately.
    if (existingUser) {
      return res.status(200).json({
        success: true,
        needsName: false,
        message: 'Email verified. Login successful.',
        token: generateToken(existingUser._id),
        user: getSafeUser(existingUser),
      })
    }

    // New customer gets a short-lived token to complete registration.
    const registrationToken = jwt.sign(
      {
        email: normalizedEmail,
        purpose: 'customer-registration',
      },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    )

    return res.status(200).json({
      success: true,
      needsName: true,
      registrationToken,
      message: 'Email verified. Please enter your name to create your account.',
    })
  } catch (error) {
    console.error('Verify customer OTP error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to verify your email.',
    })
  }
}

// Step 3: Create a new customer without asking for OTP again.
export const completeCustomerRegistration = async (req, res) => {
  try {
    const { name, registrationToken } = req.body || {}

    if (
      typeof name !== 'string' ||
      typeof registrationToken !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your name and registration verification token.',
      })
    }

    const normalizedName = name.trim()

    if (normalizedName.length < 2 || normalizedName.length > 80) {
      return res.status(400).json({
        success: false,
        message: 'Name must contain between 2 and 80 characters.',
      })
    }

    let decoded

    try {
      decoded = jwt.verify(
        registrationToken,
        process.env.JWT_SECRET
      )
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Registration verification expired. Please verify your email again.',
      })
    }

    if (
      decoded.purpose !== 'customer-registration' ||
      typeof decoded.email !== 'string'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid registration verification.',
      })
    }

    const normalizedEmail = decoded.email

    const existingUser = await User.findOne({
      email: normalizedEmail,
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in.',
      })
    }

    // Internal password hash only; customers never enter this password.
    const randomPassword = crypto.randomBytes(32).toString('hex')
    const hashedPassword = await bcrypt.hash(randomPassword, 12)

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'customer',
    })

    return res.status(201).json({
      success: true,
      message: 'Account created and login successful.',
      token: generateToken(user._id),
      user: getSafeUser(user),
    })
  } catch (error) {
    console.error('Complete customer registration error:', error.message)

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to complete registration.',
    })
  }
}
