
import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    sizes: {
      type: [String],
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      default: ['S', 'M', 'L', 'XL'],
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

const Product = mongoose.model('Product', productSchema)

export default Product
