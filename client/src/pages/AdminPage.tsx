import { useEffect, useState, type FormEvent } from 'react'
import { loginUser, logoutUser, getStoredUser, requestAdminPasswordReset, verifyAdminPasswordResetOtp, resetAdminPassword, type AuthUser } from '../services/authService'
import { getProducts, type ApiProduct } from '../services/api'
import api from '../services/api'
import './AdminPage.css'

interface AdminOrder {
  _id: string
  user: { name: string; email: string } | string
  orderItems: {
    name: string
    quantity: number
    size: string
    price: number
  }[]
  shippingAddress: {
    fullName: string
    address: string
    city: string
    pincode: string
    phone: string
  }
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  totalPrice: number
  createdAt: string
}

interface ProductForm {
  name: string
  description: string
  price: string
  category: string
  images: string
  sizes: string
  stock: string
  isFeatured: boolean
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  category: 'T-Shirts',
  images: '',
  sizes: 'S, M, L, XL',
  stock: '10',
  isFeatured: false,
}

const nextStatuses: Record<string, string[]> = {
  Placed: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: [],
}

function AdminPage({ onLogout }: { onLogout: () => void }) {
  const [admin, setAdmin] = useState<AuthUser | null>(() => {
    const user = getStoredUser()
    return user?.role === 'admin' ? user : null
  })

  const [adminChecking, setAdminChecking] = useState(() => {
  const user = getStoredUser()
  return user?.role === 'admin' && Boolean(sessionStorage.getItem('kenzukaToken'))
})

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [resetStep, setResetStep] = useState<'login' | 'email' | 'otp' | 'password'>('login')
  const [resetEmail, setResetEmail] = useState('')
  const [resetOtp, setResetOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState('')

  const [products, setProducts] = useState<ApiProduct[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview')

  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null)
  const [savingProduct, setSavingProduct] = useState(false)

  async function loadDashboard() {
  setLoading(true)
  setAdminChecking(true)
  setError('')

  try {
    const orderResponse = await api.get('/orders')
    const productList = await getProducts()

    setProducts(productList)
    setOrders(orderResponse.data.orders || [])
  } catch (err: any) {
    logoutUser()
    setAdmin(null)
    setProducts([])
    setOrders([])
    setError(
      err.response?.data?.message ||
      'Admin session could not be verified. Please sign in again.'
    )
  } finally {
    setLoading(false)
    setAdminChecking(false)
  }
}

useEffect(() => {
  if (admin) {
    void loadDashboard()
  }
}, [admin])

async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginLoading(true)
    setError('')

    try {
      const response = await loginUser({ email, password })

      if (response.user.role !== 'admin') {
        logoutUser()
        setError('Access denied. This account is not an administrator.')
        return
      }

      setAdmin(response.user)
      setPassword('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoginLoading(false)
    }
  }
  async function handleRequestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setResetLoading(true)
    setError('')
    setResetMessage('')

    try {
      const response = await requestAdminPasswordReset(resetEmail.trim())
      setResetStep('otp')
      setResetMessage(response.message)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not request a recovery code.')
    } finally {
      setResetLoading(false)
    }
  }

  async function handleVerifyResetOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setResetLoading(true)
    setError('')
    setResetMessage('')

    try {
      const response = await verifyAdminPasswordResetOtp({
        email: resetEmail.trim(),
        otp: resetOtp.trim(),
      })

      setResetToken(response.resetToken)
      setResetStep('password')
      setResetMessage(response.message)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not verify the recovery code.')
    } finally {
      setResetLoading(false)
    }
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setResetMessage('')

    if (newPassword.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setResetLoading(true)

    try {
      const response = await resetAdminPassword({
        email: resetEmail.trim(),
        resetToken,
        newPassword,
      })

      setResetStep('login')
      setEmail(resetEmail.trim())
      setPassword('')
      setResetOtp('')
      setResetToken('')
      setNewPassword('')
      setConfirmPassword('')
      setResetEmail('')
      setResetMessage(response.message)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not reset the password.')
    } finally {
      setResetLoading(false)
    }
  }

  function returnToAdminLogin() {
    setResetStep('login')
    setResetEmail('')
    setResetOtp('')
    setResetToken('')
    setNewPassword('')
    setConfirmPassword('')
    setResetMessage('')
    setError('')
  }
  function handleLogout() {
    onLogout()
    logoutUser()
    setAdmin(null)
    setProducts([])
    setOrders([])
    setActiveTab('overview')
    setError('')
  }

  function startEdit(product: ApiProduct) {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      images: product.images.join('\n'),
      sizes: product.sizes.join(', '),
      stock: String(product.stock),
      isFeatured: product.isFeatured,
    })
    setActiveTab('products')
    setMessage('')
    setError('')
  }

  function resetProductForm() {
    setForm(emptyForm)
    setEditingProduct(null)
  }

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingProduct(true)
    setError('')
    setMessage('')

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category.trim(),
      images: form.images.split(/\n|,/).map(image => image.trim()).filter(Boolean),
      sizes: form.sizes.split(',').map(size => size.trim().toUpperCase()).filter(Boolean),
      stock: Number(form.stock),
      isFeatured: form.isFeatured,
    }

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload)
        setMessage('Product updated successfully.')
      } else {
        await api.post('/products', payload)
        setMessage('Product added successfully.')
      }

      resetProductForm()
      await loadDashboard()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save the product.')
    } finally {
      setSavingProduct(false)
    }
  }

  async function deactivateProduct(product: ApiProduct) {
    const confirmed = window.confirm(`Deactivate "${product.name}"? It will no longer appear in the customer store.`)
    if (!confirmed) return

    setError('')
    setMessage('')

    try {
      await api.delete(`/products/${product._id}`)
      setMessage('Product deactivated successfully.')
      await loadDashboard()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not deactivate product.')
    }
  }

  async function updateOrderStatus(orderId: string, status: string) {
    setError('')
    setMessage('')

    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: status })
      setMessage(`Order status updated to ${status}.`)
      await loadDashboard()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not update order status.')
    }
  }

    if (adminChecking) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-card">
          <p>Verifying administrator access...</p>
        </div>
      </main>
    )
  }

  if (!admin) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-card">
          <span className="admin-eyebrow">KENZUKA CONTROL PANEL</span>

          {resetStep === 'login' && (
            <>
              <h1>ADMIN LOGIN</h1>
              <p>Sign in with your administrator account.</p>

              {error && <div className="admin-alert error">{error}</div>}
              {resetMessage && <div className="admin-alert success">{resetMessage}</div>}

              <form onSubmit={handleLogin}>
                <label>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  placeholder="Admin email"
                  required
                />

                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  placeholder="Admin password"
                  required
                />

                <button
                  type="button"
                  className="admin-forgot-link"
                  onClick={() => {
                    setResetEmail(email)
                    setError('')
                    setResetMessage('')
                    setResetStep('email')
                  }}
                >
                  Forgot Password?
                </button>

                <button className="admin-primary-button" disabled={loginLoading}>
                  {loginLoading ? 'SIGNING IN...' : 'SIGN IN'}
                </button>
              </form>

              <a className="admin-back-link" href="/">? Back to KENZUKA store</a>
            </>
          )}

          {resetStep === 'email' && (
            <>
              <h1>FORGOT PASSWORD</h1>
              <p>Enter your registered administrator email to receive a recovery code.</p>

              {error && <div className="admin-alert error">{error}</div>}
              {resetMessage && <div className="admin-alert success">{resetMessage}</div>}

              <form onSubmit={handleRequestReset}>
                <label>Admin email address</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={event => setResetEmail(event.target.value)}
                  placeholder="Enter admin email"
                  required
                />

                <button className="admin-primary-button" disabled={resetLoading}>
                  {resetLoading ? 'SENDING CODE...' : 'SEND RECOVERY CODE'}
                </button>
              </form>

              <button type="button" className="admin-back-link admin-text-button" onClick={returnToAdminLogin}>
                ? Back to login
              </button>
            </>
          )}

          {resetStep === 'otp' && (
            <>
              <h1>VERIFY CODE</h1>
              <p>Enter the six-digit recovery code sent to your registered email.</p>

              {error && <div className="admin-alert error">{error}</div>}
              {resetMessage && <div className="admin-alert success">{resetMessage}</div>}

              <form onSubmit={handleVerifyResetOtp}>
                <label>Six-digit verification code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  value={resetOtp}
                  onChange={event => setResetOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter OTP"
                  required
                />

                <button className="admin-primary-button" disabled={resetLoading}>
                  {resetLoading ? 'VERIFYING...' : 'VERIFY CODE'}
                </button>
              </form>

              <button
                type="button"
                className="admin-back-link admin-text-button"
                onClick={() => {
                  setResetStep('email')
                  setResetOtp('')
                  setError('')
                  setResetMessage('')
                }}
              >
                ? Change email
              </button>
            </>
          )}

          {resetStep === 'password' && (
            <>
              <h1>NEW PASSWORD</h1>
              <p>Create a new password for your KENZUKA administrator account.</p>

              {error && <div className="admin-alert error">{error}</div>}
              {resetMessage && <div className="admin-alert success">{resetMessage}</div>}

              <form onSubmit={handleResetPassword}>
                <label>New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={event => setNewPassword(event.target.value)}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  maxLength={72}
                  required
                />

                <label>Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={event => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter new password"
                  minLength={8}
                  maxLength={72}
                  required
                />

                <button className="admin-primary-button" disabled={resetLoading}>
                  {resetLoading ? 'UPDATING PASSWORD...' : 'RESET PASSWORD'}
                </button>
              </form>

              <button type="button" className="admin-back-link admin-text-button" onClick={returnToAdminLogin}>
                ? Back to login
              </button>
            </>
          )}
        </div>
      </main>
    )
  }
  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">KENZUKA</span>
          <h1>ADMIN PANEL</h1>
        </div>
        <div className="admin-header-right">
          <span>{admin.name}</span>
          <button className="admin-logout-button" onClick={handleLogout}>LOG OUT</button>
        </div>
      </header>

      <nav className="admin-tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>Products</button>
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>Orders</button>
      </nav>

      {error && <div className="admin-alert error">{error}</div>}
      {message && <div className="admin-alert success">{message}</div>}
      {loading && <p className="admin-loading">Loading dashboard...</p>}

      {!loading && activeTab === 'overview' && (
        <section className="admin-content">
          <h2>Dashboard overview</h2>
          <div className="admin-stats">
            <article><span>ACTIVE PRODUCTS</span><strong>{products.length}</strong></article>
            <article><span>TOTAL ORDERS</span><strong>{orders.length}</strong></article>
            <article><span>PLACED ORDERS</span><strong>{orders.filter(order => order.orderStatus === 'Placed').length}</strong></article>
            <article><span>DELIVERED ORDERS</span><strong>{orders.filter(order => order.orderStatus === 'Delivered').length}</strong></article>
          </div>

          <div className="admin-section-heading">
            <h2>Recent orders</h2>
            <button onClick={() => setActiveTab('orders')}>View all ?</button>
          </div>

          {orders.length === 0 ? <p>No orders yet.</p> : orders.slice(0, 5).map(order => (
            <div className="admin-order-row" key={order._id}>
              <div><strong>#{order._id.slice(-8).toUpperCase()}</strong><span>{order.shippingAddress?.fullName}</span></div>
              <strong>?{order.totalPrice}</strong>
              <span className="admin-status">{order.orderStatus}</span>
            </div>
          ))}
        </section>
      )}

      {!loading && activeTab === 'products' && (
        <section className="admin-content">
          <h2>{editingProduct ? 'Edit product' : 'Add a product'}</h2>

          <form className="admin-product-form" onSubmit={handleProductSubmit}>
            <label>Product name<input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></label>
            <label>Category<input value={form.category} onChange={e => setForm({...form, category: e.target.value})} required /></label>
            <label>Description<textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required /></label>
            <div className="admin-form-grid">
              <label>Price (?)<input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required /></label>
              <label>Stock<input type="number" min="0" step="1" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required /></label>
            </div>
            <label>Image URLs (one per line)<textarea value={form.images} onChange={e => setForm({...form, images: e.target.value})} placeholder="https://example.com/product.jpg" /></label>
            <label>Available sizes (comma separated)<input value={form.sizes} onChange={e => setForm({...form, sizes: e.target.value})} placeholder="S, M, L, XL" required /></label>
            <label className="admin-checkbox"><input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} /> Show as featured product</label>

            <div className="admin-form-actions">
              <button className="admin-primary-button" disabled={savingProduct}>{savingProduct ? 'SAVING...' : editingProduct ? 'UPDATE PRODUCT' : 'ADD PRODUCT'}</button>
              {editingProduct && <button type="button" className="admin-secondary-button" onClick={resetProductForm}>CANCEL EDIT</button>}
            </div>
          </form>

          <h2 className="admin-list-title">Existing products ({products.length})</h2>
          {products.map(product => (
            <article className="admin-product-row" key={product._id}>
              {product.images[0] && <img src={product.images[0]} alt={product.name} />}
              <div className="admin-product-info">
                <strong>{product.name}</strong>
                <span>{product.category} Â· ?{product.price} Â· Stock: {product.stock}</span>
                {product.isFeatured && <small>FEATURED</small>}
              </div>
              <button onClick={() => startEdit(product)}>EDIT</button>
              <button className="admin-danger-button" onClick={() => deactivateProduct(product)}>DEACTIVATE</button>
            </article>
          ))}
          {products.length === 0 && <p>No active products found.</p>}
        </section>
      )}

      {!loading && activeTab === 'orders' && (
        <section className="admin-content">
          <h2>Customer orders ({orders.length})</h2>

          {orders.length === 0 && <p>No orders have been placed yet.</p>}

          {orders.map(order => {
            const customer = typeof order.user === 'string' ? order.user : order.user?.name
            const statuses = nextStatuses[order.orderStatus] || []

            return (
              <article className="admin-order-card" key={order._id}>
                <div className="admin-order-top">
                  <strong>ORDER #{order._id.slice(-8).toUpperCase()}</strong>
                  <span className="admin-status">{order.orderStatus}</span>
                </div>
                <p><strong>Customer:</strong> {customer || order.shippingAddress?.fullName}</p>
                {typeof order.user !== 'string' && <p><strong>Email:</strong> {order.user?.email}</p>}
                <p><strong>Phone:</strong> {order.shippingAddress?.phone}</p>
                <p><strong>Address:</strong> {order.shippingAddress?.address}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}</p>

                <div className="admin-order-items">
                  {order.orderItems.map((item, index) => (
                    <p key={`${order._id}-${index}`}>{item.name} Â· Size {item.size} Â· Qty {item.quantity} Â· ?{item.price}</p>
                  ))}
                </div>

                <p><strong>Payment:</strong> {order.paymentMethod} Â· {order.paymentStatus}</p>
                <p><strong>Total:</strong> ?{order.totalPrice}</p>
                <p><strong>Placed:</strong> {new Date(order.createdAt).toLocaleString('en-IN')}</p>

                {statuses.length > 0 && (
                  <label className="admin-status-control">
                    Update status
                    <select value="" onChange={e => e.target.value && updateOrderStatus(order._id, e.target.value)}>
                      <option value="">Choose next status</option>
                      {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                )}
              </article>
            )
          })}
        </section>
      )}
    </main>
  )
}

export default AdminPage



