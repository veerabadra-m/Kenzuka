
import mongoose from 'mongoose'
import Order from '../models/Order.js'
import Product from '../models/Product.js'

// Place a new order
export const createOrder = async (req, res) => {
  let session

  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
  return res.status(400).json({
    success: false,
    message: 'Your cart is empty.',
  })
}

  // Combine duplicate products with the same size
const combinedItems = new Map()

for (const item of orderItems) {
  if (
    !item ||
    !item.product ||
    !mongoose.Types.ObjectId.isValid(item.product) ||
    !Number.isSafeInteger(item.quantity) ||
    item.quantity < 1 ||
    typeof item.size !== 'string' ||
    !item.size.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product, quantity, or size.',
    })
  }

  const normalizedSize = item.size.trim().toUpperCase()
  const key = `${item.product}-${normalizedSize}`

  if (combinedItems.has(key)) {
    const combinedQuantity =
      combinedItems.get(key).quantity + item.quantity

    if (!Number.isSafeInteger(combinedQuantity)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product quantity.',
      })
    }

    combinedItems.get(key).quantity = combinedQuantity
  } else {
    combinedItems.set(key, {
      ...item,
      size: normalizedSize,
    })
  }
}

const finalOrderItems = Array.from(combinedItems.values())


    if (
  !shippingAddress?.fullName ||
  !shippingAddress?.address ||
  !shippingAddress?.city ||
  !shippingAddress?.pincode ||
  !shippingAddress?.phone
){
      return res.status(400).json({
        success: false,
        message: 'Please provide complete shipping details.',
      })
    }

    if (!['UPI', 'Card', 'COD'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method.',
      })
    }

    session = await mongoose.startSession()

    let order

    await session.withTransaction(async () => {
      const verifiedItems = []
      let itemsPrice = 0

     for (const item of finalOrderItems) {
        if (
          !item.product ||
          !mongoose.Types.ObjectId.isValid(item.product) ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          !item.size
        ) {
          const error = new Error('Invalid product, quantity, or size.')
          error.statusCode = 400
          throw error
        }

        const product = await Product.findById(item.product).session(session)

        if (!product || !product.isActive) {
          const error = new Error('One of the products is unavailable.')
          error.statusCode = 404
          throw error
        }

        if (!product.sizes.includes(item.size)) {
          const error = new Error(
            `Size ${item.size} is unavailable for ${product.name}.`
          )
          error.statusCode = 400
          throw error
        }

        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: product._id,
            isActive: true,
            stock: { $gte: item.quantity },
            sizes: item.size,
          },
          {
            $inc: { stock: -item.quantity },
          },
          {
            new: true,
            session,
          }
        )

        if (!updatedProduct) {
          const error = new Error(
            `Insufficient stock for ${product.name}.`
          )
          error.statusCode = 400
          throw error
        }

        verifiedItems.push({
          product: product._id,
          name: product.name,
          image: product.images[0] || '',
          price: product.price,
          quantity: item.quantity,
          size: item.size,
        })

        itemsPrice += product.price * item.quantity
      }

      const deliveryFee = itemsPrice >= 1999 ? 0 : 99
      const totalPrice = itemsPrice + deliveryFee

      const createdOrders = await Order.create(
        [
          {
            user: req.user._id,
            orderItems: verifiedItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            deliveryFee,
            totalPrice,
          },
        ],
        { session }
      )

      order = createdOrders[0]
    })

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order,
    })
    } catch (error) {
    console.error('Order creation error:', error)

    if (res.headersSent) {
      return
    }

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : 'Unable to place your order.',
    })
  } finally {
    if (session) {
      await session.endSession()
    }
  }
}

// Get orders belonging to the logged-in customer
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate('orderItems.product', 'name images')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch your orders.',
    })
  }
}

// Get all customer orders (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch orders.',
    })
  }
}


// Admin: Update order status
export const updateOrderStatus = async (req, res) => {
  let session

  try {
    const { orderStatus } = req.body

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  return res.status(400).json({
    success: false,
    message: 'Invalid order ID.',
  })
}

if (typeof orderStatus !== 'string') {
  return res.status(400).json({
    success: false,
    message: 'Please provide a valid order status.',
  })
}

    const allowedTransitions = {
      Placed: ['Processing', 'Cancelled'],
      Processing: ['Shipped', 'Cancelled'],
      Shipped: ['Delivered'],
      Delivered: [],
      Cancelled: [],
    }

    if (!Object.prototype.hasOwnProperty.call(allowedTransitions, orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status.',
      })
    }

    session = await mongoose.startSession()

    let updatedOrder

    await session.withTransaction(async () => {
      const order = await Order.findById(req.params.id).session(session)

      if (!order) {
        const error = new Error('Order not found.')
        error.statusCode = 404
        throw error
      }

      const allowedNextStatuses = allowedTransitions[order.orderStatus]

      if (!allowedNextStatuses.includes(orderStatus)) {
        const error = new Error(
          `Cannot change order status from ${order.orderStatus} to ${orderStatus}.`
        )
        error.statusCode = 400
        throw error
      }

      if (orderStatus === 'Cancelled') {
        for (const item of order.orderItems) {
          if (item.product) {
            await Product.findByIdAndUpdate(
              item.product,
              {
                $inc: { stock: item.quantity },
              },
              { session }
            )
          }
        }
      }

      order.orderStatus = orderStatus
      await order.save({ session })

      updatedOrder = order
    })

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully.',
      order: updatedOrder,
    })
 } catch (error) {
  console.error('Fetch customer orders error:', error.message)

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : 'Unable to update order status.',
    })
  } finally {
    if (session) {
      await session.endSession()
    }
  }
}
