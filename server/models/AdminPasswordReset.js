import mongoose from 'mongoose'

const adminPasswordResetSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },

    otpHash: {
      type: String,
      default: '',
    },

    attempts: {
      type: Number,
      default: 0,
    },

    lastSentAt: {
      type: Date,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    resetTokenHash: {
      type: String,
      default: '',
    },

    resetTokenExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Automatically remove expired recovery records.
adminPasswordResetSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
)

const AdminPasswordReset = mongoose.model(
  'AdminPasswordReset',
  adminPasswordResetSchema
)

export default AdminPasswordReset
