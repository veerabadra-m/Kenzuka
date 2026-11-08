
import Order from '../models/Order.js'
import Product from '../models/Product.js'

// Place a new order
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
    } = req.body

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty.',
      })
    }

    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.address ||
      !shippingAddress?.city ||
      !shippingAddress?.pincode ||
      !shippingAddress?.phone
    ) {
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

    const verifiedItems = []
    let itemsPrice = 0

    for (const item of orderItems) {
      if (
        !item.product ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        !item.size
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product, quantity, or size.',
        })
      }

      const product = await Product.findById(item.product)

      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: 'One of the products is unavailable.',
        })
      }

      if (!product.sizes.includes(item.size)) {
        return res.status(400).json({
          success: false,
          message: `Size ${item.size} is unavailable for ${product.name}.`,
        })
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}.`,
        })
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

    const order = await Order.create({
      user: req.user._id,
      orderItems: verifiedItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      deliveryFee,
      totalPrice,
    })

    // Reduce stock after successfully creating the order
    for (const item of verifiedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      })
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to place your order.',
    })
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
  try {
    const { orderStatus } = req.body

    const allowedStatuses = [
      'Placed',
      'Processing',
      'Shipped',
      'Delivered',
      'Cancelled',
    ]

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status.',
      })
    }

    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      })
    }

    order.orderStatus = orderStatus

    await order.save()

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully.',
      order,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to update order status.',
    })
  }
}
