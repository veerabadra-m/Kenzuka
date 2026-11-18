import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('kenzukaToken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export interface ApiProduct {
  _id: string
  name: string
  description: string
  price: number
  category: string
  images: string[]
  sizes: string[]
  stock: number
  isFeatured: boolean
  isActive: boolean
  showIn3D?: boolean
  showInNewArrivals?: boolean
}

export const getProducts = async (): Promise<ApiProduct[]> => {
  const response = await api.get('/products')
  return response.data.products
}

export default api
