
import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    })

    console.log(`MongoDB connected: ${connection.connection.host}`)
  } catch (error) {
    console.error('\n--- MongoDB Diagnostic ---')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)

    if (error.reason?.servers) {
      for (const [address, server] of error.reason.servers) {
        console.error(`\nServer: ${address}`)
        console.error('Reason:', server.error?.message || server.type)
      }
    }

    console.error('--- End Diagnostic ---\n')
    process.exit(1)
  }
}

export default connectDB
