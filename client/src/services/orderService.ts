
import api from './api'

export interface CustomerOrderItem {
  name: string
  image?: string
  price: number
  quantity: number
  size: string
  product?: {
    images?: string[]
  } | string | null
}

export interface CustomerOrder {
  _id: string
  orderItems: CustomerOrderItem[]
  shippingAddress: {
    fullName: string
    address: string
    city: string
    pincode: string
    phone: string
  }
  paymentMethod: string
  itemsPrice: number
  deliveryFee: number
  totalPrice: number
  paymentStatus: string
  orderStatus: string
  createdAt: string
}

export interface CreateOrderInput {
  orderItems: {
    product: string
    quantity: number
    size: string
  }[]
  shippingAddress: {
    fullName: string
    address: string
    city: string
    pincode: string
    phone: string
  }
  paymentMethod: 'UPI' | 'Card' | 'COD'
}

export const createOrder = async (
  orderData: CreateOrderInput
): Promise<CustomerOrder> => {
  const response = await api.post<{ order: CustomerOrder }>(
    '/orders',
    orderData
  )

  return response.data.order
}

export const getMyOrders = async (): Promise<CustomerOrder[]> => {
  const response = await api.get<{ orders: CustomerOrder[] }>('/orders/myorders')
  return response.data.orders || []
}
