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
  requestAdminPasswordReset,
  verifyAdminPasswordResetOtp,
  resetAdminPassword,
} from '../controllers/adminPasswordResetController.js'

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

// Admin forgot password and recovery
router.post('/admin/forgot-password', requestAdminPasswordReset)
router.post('/admin/verify-reset-otp', verifyAdminPasswordResetOtp)
router.post('/admin/reset-password', resetAdminPassword)

// Customer account features
router.get('/me', protect, customerOnly, getMyProfile)
router.put('/profile', protect, customerOnly, updateProfile)
router.put('/change-password', protect, customerOnly, changePassword)
router.put('/address', protect, customerOnly, saveShippingAddress)

export default router
