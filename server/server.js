import orderRoutes from './routes/orderRoutes.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'

dotenv.config()

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json())

app.use('/api/products', productRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'KENZUKA backend is running!',
  })
})

const PORT = process.env.PORT || 5000

const startServer = async () => {
  await connectDB()

  app.listen(PORT, () => {
    console.log(`KENZUKA server running on port ${PORT}`)
  })
}

startServer()
