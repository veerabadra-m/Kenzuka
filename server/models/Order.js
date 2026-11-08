
import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        image: {
          type: String,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        size: {
          type: String,
          required: true,
        },
      },
    ],

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      pincode: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },
    },

    paymentMethod: {
      type: String,
      enum: ['UPI', 'Card', 'COD'],
      required: true,
    },

    itemsPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },

    orderStatus: {
      type: String,
      enum: [
        'Placed',
        'Processing',
        'Shipped',
        'Delivered',
        'Cancelled',
      ],
      default: 'Placed',
    },
  },
  {
    timestamps: true,
  }
)

const Order = mongoose.model('Order', orderSchema)

export default Order
