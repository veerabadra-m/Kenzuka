
import mongoose from 'mongoose'
import Product from '../models/Product.js'

const allowedFields = [
  'name',
  'description',
  'price',
  'category',
  'images',
  'sizes',
  'stock',
  'isFeatured',
  'isActive',
]

// Validate product ID
const validateProductId = (id) => {
  return mongoose.Types.ObjectId.isValid(id)
}

// Allow only approved product fields
const getProductData = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const error = new Error('Invalid product data.')
    error.statusCode = 400
    throw error
  }

  const invalidFields = Object.keys(body).filter(
    (field) => !allowedFields.includes(field)
  )

  if (invalidFields.length > 0) {
    const error = new Error(
      `Unsupported product fields: ${invalidFields.join(', ')}`
    )
    error.statusCode = 400
    throw error
  }

  return body
}

// Get all active products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    })
  } catch (error) {
    console.error('Fetch products error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Unable to fetch products.',
    })
  }
}

// Get a single product
export const getProductById = async (req, res) => {
  try {
    if (!validateProductId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      })
    }

    const product = await Product.findById(req.params.id)

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }

    res.status(200).json({
      success: true,
      product,
    })
  } catch (error) {
    console.error('Fetch product error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Unable to fetch product.',
    })
  }
}

// Create a product
export const createProduct = async (req, res) => {
  try {
    const productData = getProductData(req.body)

    const product = await Product.create(productData)

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product,
    })
  } catch (error) {
    console.error('Create product error:', error.message)

    res.status(error.statusCode || 400).json({
      success: false,
      message: error.statusCode
        ? error.message
        : 'Unable to create product. Check the product details.',
    })
  }
}

// Update a product
export const updateProduct = async (req, res) => {
  try {
    if (!validateProductId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      })
    }

    const productData = getProductData(req.body)

    if (Object.keys(productData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No product details provided.',
      })
    }

    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }

    Object.assign(product, productData)

    await product.save()

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product,
    })
  } catch (error) {
    console.error('Update product error:', error.message)

    res.status(error.statusCode || 400).json({
      success: false,
      message: error.statusCode
        ? error.message
        : 'Unable to update product. Check the product details.',
    })
  }
}

// Soft delete a product
export const deleteProduct = async (req, res) => {
  try {
    if (!validateProductId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      })
    }

    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }

    product.isActive = false
    await product.save()

    res.status(200).json({
      success: true,
      message: 'Product deactivated successfully.',
    })
  } catch (error) {
    console.error('Delete product error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Unable to deactivate product.',
    })
  }
}
