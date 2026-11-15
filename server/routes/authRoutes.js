
import express from 'express'

import {
  loginUser,
  getMyProfile,
  updateProfile,
  changePassword,
  saveShippingAddress,
} from '../controllers/authController.js'

import {
  startLogin,
  verifyCustomerOtp,
  completeCustomerRegistration,
} from '../controllers/emailOtpController.js'

import {
  protect,
  customerOnly,
} from '../middleware/authMiddleware.js'

const router = express.Router()

// Common customer/admin login flow
router.post('/start', startLogin)
router.post('/verify-otp', verifyCustomerOtp)
router.post('/complete-registration', completeCustomerRegistration)

// Admin password login
router.post('/login', loginUser)

// Customer account features
router.get('/me', protect, customerOnly, getMyProfile)
router.put('/profile', protect, customerOnly, updateProfile)
router.put('/change-password', protect, customerOnly, changePassword)
router.put('/address', protect, customerOnly, saveShippingAddress)

export default router
