
import express from 'express'

import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js'


import {
  protect,
  adminOnly,
} from '../middleware/authMiddleware.js'

const router = express.Router()

// Customer must be logged in to place an order
router.post('/', protect, createOrder)

// Get logged-in customer's orders
router.get('/myorders', protect, getMyOrders)

// Admin: Get all customer orders
router.get('/', protect, adminOnly, getAllOrders)

// Admin: Update order status
router.put('/:id/status', protect, adminOnly, updateOrderStatus)

export default router
