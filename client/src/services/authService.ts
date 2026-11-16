
import api from './api'

export interface SavedAddress {
  fullName: string
  address: string
  city: string
  pincode: string
  phone: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'customer' | 'admin'
  savedAddress?: SavedAddress
}

interface AuthResponse {
  success: boolean
  message: string
  token: string
  user: AuthUser
}

interface ProfileResponse {
  success: boolean
  message?: string
  user: AuthUser
}

interface AddressResponse {
  success: boolean
  message: string
  savedAddress: SavedAddress
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface StartLoginResponse {
  success: boolean
  method: 'password' | 'otp'
  message: string
}

export interface VerifyCustomerOtpResponse {
  success: boolean
  needsName: boolean
  message: string
  token?: string
  user?: AuthUser
  registrationToken?: string
}

// Store authenticated session
const storeAuthSession = (data: AuthResponse) => {
  sessionStorage.setItem('kenzukaToken', data.token)
  sessionStorage.setItem('kenzukaUser', JSON.stringify(data.user))
}

// Step 1: Identify whether the email belongs to an admin or customer.
export const startLogin = async (
  email: string
): Promise<StartLoginResponse> => {
  const response = await api.post<StartLoginResponse>(
    '/auth/start',
    { email }
  )

  return response.data
}

// Step 2: Verify customer OTP.
export const verifyCustomerOtp = async (
  credentials: { email: string; otp: string }
): Promise<VerifyCustomerOtpResponse> => {
  const response = await api.post<VerifyCustomerOtpResponse>(
    '/auth/verify-otp',
    credentials
  )

  if (response.data.token && response.data.user) {
    storeAuthSession(response.data as AuthResponse)
  }

  return response.data
}

// Step 3: Complete new customer registration after OTP verification.
export const completeCustomerRegistration = async (
  details: { name: string; registrationToken: string }
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    '/auth/complete-registration',
    details
  )

  storeAuthSession(response.data)

  return response.data
}

// Admin password login
export const loginUser = async (
  credentials: AuthCredentials
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    '/auth/login',
    credentials
  )

  storeAuthSession(response.data)

  return response.data
}

// Legacy registration functions retained temporarily
// They will be removed after App.tsx is updated.
export interface SendRegistrationOtpResponse {
  success: boolean
  message: string
}

export interface VerifyRegistrationOtpInput {
  name: string
  email: string
  otp: string
  password: string
}

export const sendRegistrationOtp = async (
  email: string
): Promise<SendRegistrationOtpResponse> => {
  const response = await api.post<SendRegistrationOtpResponse>(
    '/auth/register/send-otp',
    { email }
  )

  return response.data
}

export const verifyRegistrationOtp = async (
  credentials: VerifyRegistrationOtpInput
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    '/auth/register/verify-otp',
    credentials
  )

  storeAuthSession(response.data)

  return response.data
}

// Get the latest customer profile
export const getMyProfile = async (): Promise<AuthUser> => {
  const response = await api.get<ProfileResponse>('/auth/me')

  sessionStorage.setItem('kenzukaUser', JSON.stringify(response.data.user))

  return response.data.user
}

// Update customer name and email
export const updateMyProfile = async (
  details: { name: string; email: string }
): Promise<AuthUser> => {
  const response = await api.put<ProfileResponse>(
    '/auth/profile',
    details
  )

  sessionStorage.setItem('kenzukaUser', JSON.stringify(response.data.user))

  return response.data.user
}

// Save customer shipping address
export const saveMyAddress = async (
  address: SavedAddress
): Promise<SavedAddress> => {
  const response = await api.put<AddressResponse>(
    '/auth/address',
    address
  )

  const currentUser = getStoredUser()

  if (currentUser) {
    const updatedUser = {
      ...currentUser,
      savedAddress: response.data.savedAddress,
    }

    sessionStorage.setItem('kenzukaUser', JSON.stringify(updatedUser))
  }

  return response.data.savedAddress
}

export const logoutUser = () => {
  sessionStorage.removeItem('kenzukaToken')
  sessionStorage.removeItem('kenzukaUser')
}

export const getStoredUser = (): AuthUser | null => {
  const storedUser = sessionStorage.getItem('kenzukaUser')

  if (!storedUser) return null

  try {
    return JSON.parse(storedUser) as AuthUser
  } catch {
    sessionStorage.removeItem('kenzukaUser')
    sessionStorage.removeItem('kenzukaToken')
    return null
  }
}

// =====================================
// ADMIN PASSWORD RECOVERY
// =====================================

export interface AdminResetOtpResponse {
  success: boolean
  message: string
}

export interface AdminResetVerifyResponse {
  success: boolean
  message: string
  resetToken: string
}

// Step 1: Request admin recovery OTP
export const requestAdminPasswordReset = async (
  email: string
): Promise<AdminResetOtpResponse> => {
  const response = await api.post<AdminResetOtpResponse>(
    '/auth/admin/forgot-password',
    { email }
  )

  return response.data
}

// Step 2: Verify admin recovery OTP
export const verifyAdminPasswordResetOtp = async (
  credentials: { email: string; otp: string }
): Promise<AdminResetVerifyResponse> => {
  const response = await api.post<AdminResetVerifyResponse>(
    '/auth/admin/verify-reset-otp',
    credentials
  )

  return response.data
}

// Step 3: Set a new admin password
export const resetAdminPassword = async (
  credentials: {
    email: string
    resetToken: string
    newPassword: string
  }
): Promise<{ success: boolean; message: string }> => {
  const response = await api.post<{ success: boolean; message: string }>(
    '/auth/admin/reset-password',
    credentials
  )

  return response.data
}
