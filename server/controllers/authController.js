
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// Customer Registration
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password',
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const existingUser = await User.findOne({
      email: normalizedEmail,
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered',
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'customer',
    })

    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Customer Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      })
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    )

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
