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
  stock: string
  isFeatured: boolean
  showIn3D: boolean
  showInNewArrivals: boolean
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  category: 'Oversized T-Shirt',
  images: '',
  stock: '10',
  isFeatured: false,
  showIn3D: false,
  showInNewArrivals: false,
}

function getISTDate(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function formatRupees(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
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
    const [orderSearch, setOrderSearch] = useState('')
  const [orderDateFilter, setOrderDateFilter] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All')
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview')
  const [productListTab, setProductListTab] = useState<'all' | '3d' | 'new-arrivals'>('all')
  const visibleProducts = productListTab === '3d'
    ? products.filter(product => product.showIn3D)
    : productListTab === 'new-arrivals'
      ? products.filter(product => product.showInNewArrivals)
      : products
        // Dashboard analytics use Indian Standard Time.
  const todayIST = getISTDate(new Date())

  const totalRevenue = orders
    .filter(order => order.paymentStatus === 'Paid')
    .reduce((total, order) => total + Number(order.totalPrice || 0), 0)

  const todaysOrders = orders.filter(
    order => getISTDate(new Date(order.createdAt)) === todayIST
  ).length

  const pendingOrders = orders.filter(
    order => order.orderStatus === 'Placed'
  ).length

  const salesOverview = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))

    const dateKey = getISTDate(date)

    const dailyRevenue = orders
      .filter(order =>
        order.paymentStatus === 'Paid' &&
        getISTDate(new Date(order.createdAt)) === dateKey
      )
      .reduce((total, order) => total + Number(order.totalPrice || 0), 0)

    return {
      date: date.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
      }),
      revenue: dailyRevenue,
    }
  })

  const maxDailyRevenue = Math.max(
    ...salesOverview.map(day => day.revenue),
    1
  )

  const [form, setForm] = useState<ProductForm>(emptyForm)
    const filteredOrders = orders.filter(order => {
    const search = orderSearch.trim().toLowerCase()

    const customerName = (
      typeof order.user === 'string'
        ? order.user
        : order.user?.name || ''
    ).toLowerCase()

    const shippingName = (
      order.shippingAddress?.fullName || ''
    ).toLowerCase()

    const fullOrderId = order._id.toLowerCase()
    const shortOrderId = order._id.slice(-8).toLowerCase()

    const matchesSearch =
      !search ||
      fullOrderId.includes(search) ||
      shortOrderId.includes(search) ||
      customerName.includes(search) ||
      shippingName.includes(search)

    const matchesDate =
      !orderDateFilter ||
      getISTDate(new Date(order.createdAt)) === orderDateFilter

    const matchesPayment =
      paymentStatusFilter === 'All' ||
      order.paymentStatus === paymentStatusFilter

    return matchesSearch && matchesDate && matchesPayment
  })
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
      category: /cap/i.test(product.category)
        ? 'Cap'
        : /jeans|pant/i.test(product.category)
          ? 'Jeans Pant'
          : 'Oversized T-Shirt',
      images: (product.images || []).join('\n'),
      stock: String(product.stock),
      isFeatured: product.isFeatured,
      showIn3D: Boolean(product.showIn3D),
      showInNewArrivals: Boolean(product.showInNewArrivals),
    })
    setActiveTab('products')
    setProductListTab(
      product.showInNewArrivals
        ? 'new-arrivals'
        : product.showIn3D
          ? '3d'
          : 'all'
    )
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
      sizes: editingProduct ? (editingProduct.sizes || []) : [],
      showIn3D: form.showIn3D,
      showInNewArrivals: form.showInNewArrivals,
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
            <article>
              <span>TOTAL REVENUE (PAID)</span>
              <strong>{formatRupees(totalRevenue)}</strong>
            </article>

            <article>
              <span>TOTAL ORDERS</span>
              <strong>{orders.length}</strong>
            </article>

            <article>
              <span>TODAY'S ORDERS</span>
              <strong>{todaysOrders}</strong>
            </article>

            <article>
              <span>TOTAL PRODUCTS</span>
              <strong>{products.length}</strong>
            </article>

            <article>
              <span>PENDING ORDERS</span>
              <strong>{pendingOrders}</strong>
            </article>
          </div>

          <div className="admin-sales-card">
            <div className="admin-section-heading">
              <div>
                <h2>Sales overview</h2>
                <p>Paid revenue over the last 7 days</p>
              </div>
              <strong>{formatRupees(
                salesOverview.reduce((total, day) => total + day.revenue, 0)
              )}</strong>
            </div>

            <div className="admin-sales-chart">
              {salesOverview.map(day => (
                <div className="admin-sales-day" key={day.date}>
                  <strong>{formatRupees(day.revenue)}</strong>
                  <div className="admin-sales-bar-track">
                    <div
                      className="admin-sales-bar"
                      style={{
                        height: `${Math.max(
                          (day.revenue / maxDailyRevenue) * 100,
                          3
                        )}%`,
                      }}
                    />
                  </div>
                  <span>{day.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-section-heading">
            <h2>Recent orders</h2>
            <button onClick={() => setActiveTab('orders')}>View all →</button>
          </div>

          {orders.length === 0 ? <p>No orders yet.</p> : orders.slice(0, 5).map(order => (
            <div className="admin-order-row" key={order._id}>
              <div>
                <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                <span>{order.shippingAddress?.fullName}</span>
              </div>
              <strong>{formatRupees(order.totalPrice)}</strong>
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
            <label>Category
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                <option value="Oversized T-Shirt">Oversized T-Shirt</option>
                <option value="Cap">Cap</option>
                <option value="Jeans Pant">Jeans Pant</option>
              </select>
            </label>
            <label>Description<textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required /></label>
            <div className="admin-form-grid">
              <label>Price (?)<input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required /></label>
              <label>Stock<input type="number" min="0" step="1" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required /></label>
            </div>
            <label>Image URLs (one per line)<textarea value={form.images} onChange={e => setForm({...form, images: e.target.value})} placeholder="https://example.com/product.jpg" /></label>
            
            <label className="admin-checkbox"><input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} /> Show as featured product</label>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={form.showIn3D}
                onChange={e => {
                  const checked = e.target.checked
                  const selectedCount = products.filter(
                    product => product.showIn3D && product._id !== editingProduct?._id
                  ).length

                  if (checked && !form.showIn3D && selectedCount >= 7) {
                    setError('3D Collection already has 7 products. Turn one off before selecting another.')
                    return
                  }

                  setError('')
                  setForm({...form, showIn3D: checked})
                }}
              />
              Show in 3D Collection (maximum 7)
            </label>

            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={form.showInNewArrivals}
                onChange={e => {
                  const checked = e.target.checked
                  const selectedCount = products.filter(
                    product => product.showInNewArrivals && product._id !== editingProduct?._id
                  ).length

                  if (checked && !form.showInNewArrivals && selectedCount >= 4) {
                    setError('New Arrivals already has 4 products. Turn one off before selecting another.')
                    return
                  }

                  setError('')
                  setForm({...form, showInNewArrivals: checked})
                }}
              />
              Show in New Arrivals (maximum 4)
            </label>

            <div className="admin-form-actions">
              <button className="admin-primary-button" disabled={savingProduct}>{savingProduct ? 'SAVING...' : editingProduct ? 'UPDATE PRODUCT' : 'ADD PRODUCT'}</button>
              {editingProduct && <button type="button" className="admin-secondary-button" onClick={resetProductForm}>CANCEL EDIT</button>}
            </div>
          </form>

          <h2 className="admin-list-title">Manage your products</h2>

          <div className="admin-product-subtabs">
            <button
              type="button"
              className={productListTab === 'all' ? 'active' : ''}
              onClick={() => setProductListTab('all')}
            >
              ALL PRODUCTS <span>{products.length}</span>
            </button>
            <button
              type="button"
              className={productListTab === '3d' ? 'active' : ''}
              onClick={() => setProductListTab('3d')}
            >
              3D COLLECTION <span>{products.filter(product => product.showIn3D).length}/7</span>
            </button>
            <button
              type="button"
              className={productListTab === 'new-arrivals' ? 'active' : ''}
              onClick={() => setProductListTab('new-arrivals')}
            >
              NEW ARRIVALS <span>{products.filter(product => product.showInNewArrivals).length}/4</span>
            </button>
          </div>

          <h3 className="admin-product-count">
            {productListTab === '3d'
              ? '3D Collection Products'
              : productListTab === 'new-arrivals'
                ? 'New Arrivals Products'
                : 'All Active Products'}
            {' '}({visibleProducts.length})
          </h3>

          {visibleProducts.map(product => (
            <article className="admin-product-row" key={product._id}>
              {product.images[0] && <img src={product.images[0]} alt={product.name} />}
              <div className="admin-product-info">
                <strong>{product.name}</strong>
                <span>{product.category} | ₹{product.price} | Stock: {product.stock}</span>
                {product.isFeatured && <small>FEATURED</small>}
                {product.showIn3D && <small>3D COLLECTION</small>}
                {product.showInNewArrivals && <small>NEW ARRIVAL</small>}
              </div>
              <button onClick={() => startEdit(product)}>EDIT</button>
              <button className="admin-danger-button" onClick={() => deactivateProduct(product)}>DEACTIVATE</button>
            </article>
          ))}

          {visibleProducts.length === 0 && (
            <p>
              {productListTab === '3d'
                ? 'No products selected for the 3D Collection yet.'
                : productListTab === 'new-arrivals'
                  ? 'No products selected for New Arrivals yet.'
                  : 'No active products found.'}
            </p>
          )}
        </section>
      )}

           {!loading && activeTab === 'orders' && (
        <section className="admin-content">
          <h2>Customer orders ({filteredOrders.length} / {orders.length})</h2>

          <div className="admin-order-filters">
            <label>
              Search orders
              <input
                type="search"
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                placeholder="Order ID or customer name"
              />
            </label>

            <label>
              Order date
              <input
                type="date"
                value={orderDateFilter}
                onChange={e => setOrderDateFilter(e.target.value)}
              />
            </label>

            <label>
              Payment status
              <select
                value={paymentStatusFilter}
                onChange={e => setPaymentStatusFilter(e.target.value)}
              >
                <option value="All">All payments</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Failed">Failed</option>
              </select>
            </label>

            <button
              type="button"
              className="admin-clear-filters"
              onClick={() => {
                setOrderSearch('')
                setOrderDateFilter('')
                setPaymentStatusFilter('All')
              }}
            >
              Clear filters
            </button>
          </div>

          {orders.length === 0 && (
            <p>No orders have been placed yet.</p>
          )}

          {orders.length > 0 && filteredOrders.length === 0 && (
            <p className="admin-no-results">
              No orders match your search or selected filters.
            </p>
          )}

          {filteredOrders.map(order => {
            const customer = typeof order.user === 'string'
              ? order.user
              : order.user?.name


            return (
              <article className="admin-order-card" key={order._id}>
                <div className="admin-order-top">
                  <strong>ORDER #{order._id.slice(-8).toUpperCase()}</strong>
                  <span className="admin-status">{order.orderStatus}</span>
                </div>

                <p>
                  <strong>Customer:</strong>{' '}
                  {customer || order.shippingAddress?.fullName}
                </p>

                {typeof order.user !== 'string' && (
                  <p><strong>Email:</strong> {order.user?.email}</p>
                )}

                <p>
                  <strong>Phone:</strong> {order.shippingAddress?.phone}
                </p>

                <p>
                  <strong>Address:</strong>{' '}
                  {order.shippingAddress?.address}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}
                </p>

                <div className="admin-order-items">
                  {order.orderItems.map((item, index) => (
                    <p key={`${order._id}-${index}`}>
                      {item.name} | Size {item.size} | Qty {item.quantity} | ₹{item.price}
                    </p>
                  ))}
                </div>

                <p>
                  <strong>Payment:</strong> {order.paymentMethod} | {order.paymentStatus}
                </p>

                <p><strong>Total:</strong> {formatRupees(order.totalPrice)}</p>

                <p>
                  <strong>Placed:</strong>{' '}
                  {new Date(order.createdAt).toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                  })}
                </p>

              </article>
            )
          })}
        </section>
      )}
    </main>
  )
}

export default AdminPage






