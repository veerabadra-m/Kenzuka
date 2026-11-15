
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// Admin and legacy password login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {}

    if (
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email and password.',
      })
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select('+password')

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to log in.',
    })
  }
}

// Get customer profile
export const getMyProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        savedAddress: req.user.savedAddress,
      },
    })
  } catch (error) {
    console.error('Get profile error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve profile.',
    })
  }
}

// Update customer profile
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body || {}

    if (
      typeof name !== 'string' ||
      name.trim().length < 2 ||
      name.trim().length > 80
    ) {
      return res.status(400).json({
        success: false,
        message: 'Name must contain between 2 and 80 characters.',
      })
    }

    req.user.name = name.trim()
    await req.user.save()

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        savedAddress: req.user.savedAddress,
      },
    })
  } catch (error) {
    console.error('Update profile error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to update profile.',
    })
  }
}

// Change customer password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {}

    if (
      typeof currentPassword !== 'string' ||
      typeof newPassword !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both passwords.',
      })
    }

    if (
      newPassword.length < 6 ||
      Buffer.byteLength(newPassword, 'utf8') > 72
    ) {
      return res.status(400).json({
        success: false,
        message: 'New password must contain at least 6 characters and cannot exceed 72 bytes.',
      })
    }

    const user = await User.findById(req.user._id).select('+password')

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      })
    }

    user.password = await bcrypt.hash(newPassword, 12)
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    })
  } catch (error) {
    console.error('Change password error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to change password.',
    })
  }
}

// Save customer shipping address
export const saveShippingAddress = async (req, res) => {
  try {
    const { fullName, address, city, pincode, phone } = req.body || {}

    if (
      typeof fullName !== 'string' ||
      typeof address !== 'string' ||
      typeof city !== 'string' ||
      typeof pincode !== 'string' ||
      typeof phone !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all shipping address fields.',
      })
    }

    if (
      fullName.trim().length < 2 ||
      address.trim().length < 5 ||
      city.trim().length < 2 ||
      !/^\d{6}$/.test(pincode.trim()) ||
      !/^\d{10}$/.test(phone.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid shipping address details.',
      })
    }

    req.user.savedAddress = {
      fullName: fullName.trim(),
      address: address.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      phone: phone.trim(),
    }

    await req.user.save()

    return res.status(200).json({
      success: true,
      message: 'Shipping address saved successfully.',
      savedAddress: req.user.savedAddress,
    })
  } catch (error) {
    console.error('Save address error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to save shipping address.',
    })
  }
}
