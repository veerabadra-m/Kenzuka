
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Verify user authentication
export const protect = async (req, res, next) => {
  try {
    let token

    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in.',
      })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find logged-in user
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      })
    }

    req.user = user

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    })
  }
}

// Check admin access
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next()
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin only.',
  })
}
