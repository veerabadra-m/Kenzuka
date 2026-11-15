import { useEffect, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts, type ApiProduct } from './services/api'
import {
  createOrder,
  getMyOrders,
  type CustomerOrder,
} from './services/orderService'
import {
  loginUser,
  startLogin,
  verifyCustomerOtp,
  completeCustomerRegistration,
  logoutUser,
  getStoredUser,
  getMyProfile,
  updateMyProfile,
  saveMyAddress,
  type AuthUser,
  type SavedAddress,
} from './services/authService'
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ArrowUpRight,
  Camera,
  Heart,
  UserRound,
} from 'lucide-react'
import LandingPage from './LandingPage'
import './App.css'
const categories = [
  {
    name: 'T-SHIRTS',
    subtitle: 'Everyday statements',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
  },
  {
    name: 'STREETWEAR',
    subtitle: 'Own your identity',
    image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800',
  },
  {
    name: 'JACKETS',
    subtitle: 'Make an entrance',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
  },
  {
    name: 'ESSENTIALS',
    subtitle: 'Made to stand out',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800',
  },
]
type StoreProduct = ApiProduct & {
  image: string
  tag: string
}
function App() {
  const navigate = useNavigate()
  const [showShop, setShowShop] = useState(false)
    // ACCOUNT / AUTHENTICATION
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(
    () => getStoredUser()
  )

  const [showAccount, setShowAccount] = useState(false)

  const [showOrders, setShowOrders] = useState(false)
const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([])
const [ordersLoading, setOrdersLoading] = useState(false)
const [ordersError, setOrdersError] = useState('')
// CUSTOMER ACCOUNT SETTINGS
const [accountView, setAccountView] = useState<
  'home' | 'profile' | 'address'
>('home')

const [profileName, setProfileName] = useState('')
const [profileEmail, setProfileEmail] = useState('')

const [savedAddressForm, setSavedAddressForm] = useState<SavedAddress>({
  fullName: '',
  address: '',
  city: '',
  pincode: '',
  phone: '',
})

const [accountActionLoading, setAccountActionLoading] = useState(false)
const [accountActionError, setAccountActionError] = useState('')
const [accountActionSuccess, setAccountActionSuccess] = useState('')
const [authStep, setAuthStep] = useState<
  'email' | 'otp' | 'password' | 'name'
>('email')

const [authName, setAuthName] = useState('')
const [authEmail, setAuthEmail] = useState('')
const [authPassword, setAuthPassword] = useState('')
const [authOtp, setAuthOtp] = useState('')
const [registrationToken, setRegistrationToken] = useState('')

const [authLoading, setAuthLoading] = useState(false)
const [authError, setAuthError] = useState('')

  const [menuOpen, setMenuOpen] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [orderCopied, setOrderCopied] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [orderDate, setOrderDate] = useState('')
 const [selectedPaymentMethod, setSelectedPaymentMethod] =
  useState<'UPI' | 'Card' | 'COD'>('UPI')

const [orderSubmitting, setOrderSubmitting] = useState(false)
const [orderError, setOrderError] = useState('')

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerCity, setCustomerCity] = useState('')
  const [customerPincode, setCustomerPincode] = useState('')

  const [products, setProducts] = useState<StoreProduct[]>([])
  // PRODUCT SEARCH, FILTER AND WISHLIST
const [searchTerm, setSearchTerm] = useState('')
const [selectedCategory, setSelectedCategory] = useState('ALL')
const [sortOrder, setSortOrder] = useState<'default' | 'low-high' | 'high-low'>('default')
const [showSearch, setShowSearch] = useState(false)
const [showWishlistOnly, setShowWishlistOnly] = useState(false)
const [showWishlistPage, setShowWishlistPage] = useState(false)

const [wishlist, setWishlist] = useState<string[]>(() => {
  try {
    return JSON.parse(localStorage.getItem('kenzukaWishlist') || '[]') as string[]
  } catch {
    return []
  }
})
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')

  useEffect(() => {
    let active = true

    const loadProducts = async () => {
      try {
        const data = await getProducts()

        if (active) {
          setProducts(
            data.map((product) => ({
              ...product,
              image:
                product.images?.[0] ||
                'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700',
              tag: product.isFeatured ? 'FEATURED' : 'NEW ARRIVAL',
            }))
          )
        }
      } catch {
        if (active) {
          setProductsError('Unable to load products. Please try again later.')
        }
      } finally {
        if (active) setProductsLoading(false)
      }
    }

    loadProducts()

    return () => {
      active = false
    }
  }, [])
  // SAVE WISHLIST WHENEVER IT CHANGES
useEffect(() => {
  localStorage.setItem('kenzukaWishlist', JSON.stringify(wishlist))
}, [wishlist])
// LOAD CUSTOMER PROFILE AND SAVED ADDRESS WHEN ACCOUNT OPENS
useEffect(() => {
  if (!showAccount || currentUser?.role !== 'customer') return

  let active = true

  const loadProfile = async () => {
    try {
      const user = await getMyProfile()

      if (!active) return

      setCurrentUser(user)
      setProfileName(user.name)
      setProfileEmail(user.email)

      if (user.savedAddress) {
        const address = user.savedAddress

        setSavedAddressForm({
          fullName: address.fullName || '',
          address: address.address || '',
          city: address.city || '',
          pincode: address.pincode || '',
          phone: address.phone || '',
        })

        setCustomerName(address.fullName || '')
        setCustomerAddress(address.address || '')
        setCustomerCity(address.city || '')
        setCustomerPincode(address.pincode || '')
        setCustomerPhone(address.phone || '')
      }

      setCustomerEmail(user.email)
    } catch {
      if (active) {
        setAccountActionError('Unable to load your account details.')
      }
    }
  }

  void loadProfile()

  return () => {
    active = false
  }
}, [showAccount, currentUser?.role])
// TOGGLE A PRODUCT IN THE WISHLIST
const toggleWishlist = (productId: string) => {
  setWishlist((previous) =>
    previous.includes(productId)
      ? previous.filter((id) => id !== productId)
      : [...previous, productId]
  )
}

// AVAILABLE PRODUCT CATEGORIES
const availableCategories = Array.from(
  new Set(products.map((product) => product.category).filter(Boolean))
)

// SEARCH, CATEGORY FILTER AND WISHLIST FILTER
const filteredProducts = products
  .filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase())

    const matchesCategory =
      selectedCategory === 'ALL' ||
      product.category === selectedCategory

    const matchesWishlist =
      !showWishlistOnly || wishlist.includes(product._id)

    return matchesSearch && matchesCategory && matchesWishlist
  })
  .sort((a, b) => {
    if (sortOrder === 'low-high') return a.price - b.price
    if (sortOrder === 'high-low') return b.price - a.price
    return 0
  })

const handleAuthSubmit = async () => {
  setAuthError('')
  setAuthLoading(true)

  try {
    // STEP 1: Check the email and determine the login method
    if (authStep === 'email') {
      const response = await startLogin(authEmail.trim())

      setAuthStep(response.method)
      setAuthPassword('')
      setAuthOtp('')
      return
    }

    // STEP 2: Admin password login
    if (authStep === 'password') {
      const response = await loginUser({
        email: authEmail.trim(),
        password: authPassword,
      })

      setCurrentUser(response.user)
      setShowAccount(false)

      setAuthStep('email')
      setAuthName('')
      setAuthEmail('')
      setAuthPassword('')
      setAuthOtp('')
      setRegistrationToken('')
      setAuthError('')

      if (response.user.role === 'admin') {
        navigate('/admin')
      }

      return
    }

    // STEP 3: Customer OTP verification
    if (authStep === 'otp') {
      const response = await verifyCustomerOtp({
        email: authEmail.trim(),
        otp: authOtp,
      })

      // Existing customer: login immediately
      if (!response.needsName && response.user) {
        setCurrentUser(response.user)
        setShowAccount(false)

        setAuthStep('email')
        setAuthName('')
        setAuthEmail('')
        setAuthPassword('')
        setAuthOtp('')
        setRegistrationToken('')
        setAuthError('')

        return
      }

      // New customer: OTP is already verified.
      // Ask only for the name; do not ask for OTP again.
      if (response.needsName && response.registrationToken) {
        setRegistrationToken(response.registrationToken)
        setAuthOtp('')
        setAuthStep('name')
        return
      }

      throw new Error('Unable to complete verification. Please try again.')
    }

    // STEP 4: Create a new customer account after OTP verification
    if (authStep === 'name') {
      const response = await completeCustomerRegistration({
        name: authName.trim(),
        registrationToken,
      })

      setCurrentUser(response.user)
      setShowAccount(false)

      setAuthStep('email')
      setAuthName('')
      setAuthEmail('')
      setAuthPassword('')
      setAuthOtp('')
      setRegistrationToken('')
      setAuthError('')
    }
  } catch (error: unknown) {
    const apiError = error as {
      response?: {
        data?: {
          message?: string
        }
      }
      message?: string
    }

    setAuthError(
      apiError.response?.data?.message ||
        apiError.message ||
        'Something went wrong. Please try again.'
    )
  } finally {
    setAuthLoading(false)
  }
}
   const handleLogout = () => {
    logoutUser()
    setCurrentUser(null)
    setShowAccount(false)
  }

  const handleViewOrders = async () => {
    setShowOrders(true)
    setOrdersLoading(true)
    setOrdersError('')

    try {
      const orders = await getMyOrders()
      setCustomerOrders(orders)
    } catch {
      setOrdersError('Unable to load your orders. Please try again.')
    } finally {
      setOrdersLoading(false)
    }
  }

const [selectedProduct, setSelectedProduct] =
  useState<StoreProduct | null>(null)

const [selectedImageIndex, setSelectedImageIndex] = useState(0)
const [isImageZoomOpen, setIsImageZoomOpen] = useState(false)
  // UPDATE CUSTOMER PROFILE
  const handleSaveProfile = async () => {
    setAccountActionError('')
    setAccountActionSuccess('')
    setAccountActionLoading(true)

    try {
      const updatedUser = await updateMyProfile({
        name: profileName,
        email: profileEmail,
      })

      setCurrentUser(updatedUser)
      setCustomerEmail(updatedUser.email)
      setAccountActionSuccess('Your profile has been updated successfully.')
      setAccountView('home')
    } catch (error: unknown) {
      const apiError = error as {
        response?: { data?: { message?: string } }
      }
      setAccountActionError(
        apiError.response?.data?.message || 'Unable to update your profile.'
      )
    } finally {
      setAccountActionLoading(false)
    }
  }

  // SAVE CUSTOMER DELIVERY ADDRESS
  const handleSaveAddress = async () => {
    setAccountActionError('')
    setAccountActionSuccess('')
    setAccountActionLoading(true)

    try {
      const address = await saveMyAddress(savedAddressForm)

      setSavedAddressForm(address)
      setCustomerName(address.fullName)
      setCustomerAddress(address.address)
      setCustomerCity(address.city)
      setCustomerPincode(address.pincode)
      setCustomerPhone(address.phone)

      setCurrentUser((previous) =>
        previous ? { ...previous, savedAddress: address } : previous
      )

      setAccountActionSuccess('Your delivery address has been saved.')
      setAccountView('home')
    } catch (error: unknown) {
      const apiError = error as {
        response?: { data?: { message?: string } }
      }
      setAccountActionError(
        apiError.response?.data?.message || 'Unable to save your address.'
      )
    } finally {
      setAccountActionLoading(false)
    }
  }

  // PLACE CUSTOMER ORDER
  const handlePlaceOrder = async () => {
    setOrderError('')

    if (!currentUser || currentUser.role !== 'customer') {
      setShowPayment(false)
      setShowCheckout(false)
      setShowCart(false)
      setShowOrders(false)
     setAuthStep('email')
      setAuthError('Please log in with your customer account before placing an order.')
      setShowAccount(true)
      return
    }

    if (cart.length === 0) {
      setOrderError('Your cart is empty.')
      return
    }

    setOrderSubmitting(true)

    try {
      const savedOrder = await createOrder({
        orderItems: cart.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          size: item.size,
        })),
        shippingAddress: {
          fullName: customerName,
          address: customerAddress,
          city: customerCity,
          pincode: customerPincode,
          phone: customerPhone,
        },
        paymentMethod: selectedPaymentMethod,
      })

      const orderCreatedAt = new Date(savedOrder.createdAt)

      const datePart = orderCreatedAt
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        .replace(/ /g, '')
        .toUpperCase()

      const timePart =
        String(orderCreatedAt.getHours()).padStart(2, '0') +
        String(orderCreatedAt.getMinutes()).padStart(2, '0')

      const productName =
        cart.length === 1
          ? cart[0].product.name
          : `${cart[0].product.name}-PLUS-${cart.length - 1}`

      const productPart =
        productName
          .normalize('NFKD')
          .replace(/[^a-zA-Z0-9]+/g, '')
          .toUpperCase()
          .slice(0, 12) || 'PRODUCT'

      const uniquePart = savedOrder._id.slice(-4).toUpperCase()

      setOrderId(`KEN-${datePart}-${timePart}-${productPart}-${uniquePart}`)

      setOrderDate(
        new Date(savedOrder.createdAt).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      )

      setOrderCopied(false)
      setShowPayment(false)
      setShowConfirmation(true)
    } catch (error: unknown) {
      const apiError = error as {
        response?: {
          data?: {
            message?: string
          }
        }
      }

      setOrderError(
        apiError.response?.data?.message ||
          'Unable to place your order. Please try again.'
      )
    } finally {
      setOrderSubmitting(false)
    }
  }

  const [selectedSize, setSelectedSize] = useState('')

  const [cart, setCart] = useState<{
    product: StoreProduct
    size: string
    quantity: number
  }[]>([])

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  )

const cartSubtotal = cart.reduce(
  (total, item) => total + item.product.price * item.quantity,
  0
)

if (!showShop) {
  return <LandingPage onEnter={() => setShowShop(true)} />
}

if (showConfirmation) {
  return (
    <main className="checkout-page confirmation-page">
      <header className="checkout-header">
        <h1>KENZUKA</h1>
        <p>ORDER CONFIRMATION</p>
      </header>

      <section className="confirmation-card">
     <div className="confirmation-order-id">
  <span>ORDER REFERENCE : </span>
  <strong>{orderId}</strong>
</div>

<p className="confirmation-date">
  ORDER DATE : {orderDate}
</p>
<button
  type="button"
  className="copy-order-button"
  onClick={async () => {
    try {
      await navigator.clipboard.writeText(orderId)
      setOrderCopied(true)
    } catch {
      alert('Unable to copy the order reference.')
    }
  }}
>
  {orderCopied ? 'COPIED ?' : 'COPY ORDER ID'}
</button>

        <p className="eyebrow">THANK YOU FOR CHOOSING KENZUKA</p>
        <h2>THANK YOU FOR YOUR ORDER!</h2>

        <p className="confirmation-message">
  Your order has been successfully placed!
  Thank you for shopping with KENZUKA.
</p>

<div className="delivery-estimate">
  <h3>EXPECTED DELIVERY</h3>
  <p>Your order will be delivered within</p>
  <strong>4-5 DAYS</strong>
</div>
        <div className="confirmation-details">
          <h3>DELIVERY DETAILS</h3>
          <p><strong>Name:</strong> {customerName}</p>
          <p><strong>Email:</strong> {customerEmail}</p>
          <p><strong>Phone:</strong> {customerPhone}</p>
          <p>
            <strong>Address:</strong> {customerAddress}, {customerCity} - {customerPincode}
          </p>
        </div>

        <div className="confirmation-details">
          <h3>PAYMENT METHOD</h3>
         <p>
  {selectedPaymentMethod === 'COD'
    ? 'Cash on Delivery'
    : selectedPaymentMethod === 'Card'
    ? 'Debit / Credit Card'
    : 'UPI'}
</p>

<p className="demo-notice">
  Payment processing is not connected yet. No online payment has been charged.
</p>
        </div>

        <div className="confirmation-details">
          <h3>ORDER SUMMARY</h3>

          {cart.map((item, index) => (
            <div
              className="confirmation-order-item"
              key={`${item.product.name}-${item.size}-${index}`}
            >
              <span>
                {item.product.name} ({item.size})
              </span>
              <strong>
                {"\u20B9"}{(item.product.price * item.quantity).toLocaleString('en-IN')}
              </strong>
            </div>
          ))}

          <div className="checkout-total">
            <span>Total Amount</span>
            <strong>{"\u20B9"}{cartSubtotal.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <button
          className="checkout-button"
          onClick={() => {
            setShowConfirmation(false)
            setShowPayment(false)
            setShowCheckout(false)
            setShowCart(false)
            setCart([])
            setShowShop(true)
          }}
        >
          CONTINUE SHOPPING
        </button>
      </section>
    </main>
  )
}

if (showPayment) {
  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <h1>KENZUKA</h1>
        <p>PAYMENT</p>
      </header>

      <button
        className="back-shopping"
        onClick={() => {
          setShowPayment(false)
          setShowCheckout(true)
        }}
      >
        BACK TO DELIVERY DETAILS
      </button>

      <div className="checkout-container">
        <section className="checkout-form-section">
          <p className="eyebrow">SECURE PAYMENT</p>
          <h2>CHOOSE PAYMENT METHOD</h2>

          <div className="payment-options">
            <label>
              <input
                type="radio"
                name="payment"
                value="UPI"
                checked={selectedPaymentMethod === 'UPI'}
                onChange={(event) =>
                setSelectedPaymentMethod(
  event.target.value as 'UPI' | 'Card' | 'COD'
)
                }
              />
              UPI (Google Pay / PhonePe / Paytm)
            </label>

            <label>
              <input
                type="radio"
                name="payment"
                value="Card"
                checked={selectedPaymentMethod === 'Card'}
                onChange={(event) =>
                 setSelectedPaymentMethod(
  event.target.value as 'UPI' | 'Card' | 'COD'
)
                }
              />
              Debit / Credit Card
            </label>

            <label>
              <input
                type="radio"
                name="payment"
                value="COD"
                checked={selectedPaymentMethod === 'COD'}
                onChange={(event) =>
                  setSelectedPaymentMethod(
  event.target.value as 'UPI' | 'Card' | 'COD'
)
                }
              />
              Cash on Delivery
            </label>
                 </div>
<div className="payment-instructions">
  {selectedPaymentMethod === 'UPI' && (
    <p>
      You can pay using Google Pay, PhonePe or Paytm.
      You will be redirected to a secure payment gateway
      when online payments are activated.
    </p>
  )}

  {selectedPaymentMethod === 'Card' && (
    <p>
      Debit and credit card payments will be processed
      through a secure payment gateway. Your card details
      will not be collected on this demo page.
    </p>
  )}

  {selectedPaymentMethod === 'COD' && (
    <p>
      Pay in cash when your KENZUKA order is delivered
      to your address.
    </p>
  )}
</div>
    {orderError && (
  <p
    role="alert"
    style={{ color: '#ff7777', fontSize: '13px', marginBottom: '12px' }}
  >
    {orderError}
  </p>
)}

<button
  type="button"
  className="checkout-button"
  onClick={handlePlaceOrder}
  disabled={orderSubmitting}
>
  {orderSubmitting ? 'PLACING ORDER...' : 'PLACE ORDER'}
</button>
      </section>

      <aside className="checkout-order-section">
        <p className="eyebrow">KENZUKA COLLECTION</p>
        <h2>ORDER SUMMARY</h2>

        {cart.map((item, index) => (
          <div
            className="checkout-order-item"
            key={`${item.product.name}-${item.size}-${index}`}
          >
            <img src={item.product.image} alt={item.product.name} />

            <div>
              <h3>{item.product.name}</h3>
              <p>Size: {item.size}</p>
              <p>Quantity: {item.quantity}</p>
              <strong>
                {"\u20B9"}{(item.product.price * item.quantity).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        ))}

        <div className="checkout-total">
          <span>Total Amount</span>
          <strong>{"\u20B9"}{cartSubtotal.toLocaleString('en-IN')}</strong>
        </div>
      </aside>
    </div>
  </main>
  )


}

if (showCheckout) {
  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <h1>KENZUKA</h1>
        <p>SECURE CHECKOUT</p>
      </header>

      <button
        className="back-shopping"
        onClick={() => setShowCheckout(false)}
      >
        BACK TO SHOPPING
      </button>

      <div className="checkout-container">
        <section className="checkout-form-section">
          <p className="eyebrow">YOUR DETAILS</p>
          <h2>DELIVERY INFORMATION</h2>

          <form
            id="checkout-form"
            onSubmit={(event) => {
              event.preventDefault()
              setShowCheckout(false)
              setShowPayment(true)
            }}
          >
            <label>FULL NAME</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              required
            />

            <label>EMAIL ADDRESS</label>
            <input
              type="email"
              placeholder="Enter your email address"
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              required
            />

            <label>PHONE NUMBER</label>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              pattern="[6-9][0-9]{9}"
              maxLength={10}
              required
            />

            <label>DELIVERY ADDRESS</label>
            <textarea
              placeholder="House number, street, area"
              value={customerAddress}
              onChange={(event) => setCustomerAddress(event.target.value)}
              required
            />

            <div className="checkout-two-columns">
              <div>
                <label>CITY</label>
                <input
                  type="text"
                  placeholder="City"
                  value={customerCity}
                  onChange={(event) => setCustomerCity(event.target.value)}
                  required
                />
              </div>

              <div>
                <label>PINCODE</label>
                <input
                  type="text"
                  placeholder="6-digit pincode"
                  value={customerPincode}
                  onChange={(event) => setCustomerPincode(event.target.value)}
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                />
              </div>
            </div>
          </form>
        </section>

        <aside className="checkout-order-section">
          <p className="eyebrow">KENZUKA COLLECTION</p>
          <h2>ORDER SUMMARY</h2>

          {cart.map((item, index) => (
            <div
              className="checkout-order-item"
              key={`${item.product.name}-${item.size}-${index}`}
            >
              <img src={item.product.image} alt={item.product.name} />

              <div>
                <h3>{item.product.name}</h3>
                <p>Size: {item.size}</p>
                <p>Quantity: {item.quantity}</p>
                <strong>
                  {"\u20B9"}{(item.product.price * item.quantity).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>
          ))}

          <div className="checkout-total">
            <span>Total Amount</span>
            <strong>{"\u20B9"}{cartSubtotal.toLocaleString('en-IN')}</strong>
          </div>

          <button
            className="checkout-button"
            type="submit"
            form="checkout-form"
          >
            CONTINUE TO PAYMENT
          </button>
        </aside>
      </div>
    </main>
  )
}

return (
    <main className="website">

      <div className="announcement">
        <span>KENZUKA | QUALITY FIRST | MADE FOR EVERYDAY | STYLE WITHOUT LIMITS</span>
        <span>DISCOVER YOUR NEXT LOOK <ArrowUpRight size={13} /></span>
      </div>

      <header className="navbar">
        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <a href="#home" className="brand-logo">
          <img src="/kenzuka-logo.jpeg" alt="KENZUKA" />
        </a>

        <nav className={menuOpen ? 'nav-links active' : 'nav-links'}>
          <a href="#home" onClick={() => setMenuOpen(false)}>HOME</a>
          <a href="#collections" onClick={() => setMenuOpen(false)}>COLLECTIONS</a>
          <a href="#arrivals" onClick={() => setMenuOpen(false)}>NEW ARRIVALS</a>
          <a href="#custom-design" onClick={() => setMenuOpen(false)}>CUSTOM DESIGN</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>OUR STORY</a>
        </nav>

           <div className="nav-actions">
          <button
  aria-label="Search products"
  onClick={() => {
    setShowSearch((previous) => !previous)
    setShowWishlistOnly(false)
    document.getElementById('arrivals')?.scrollIntoView({ behavior: 'smooth' })
  }}
>
  <Search />
</button>

          <button
            aria-label="My account"
            onClick={() => {
              setAuthError('')
              setShowAccount(true)
            }}
          >
            <UserRound />
          </button>

          {/* WISHLIST BUTTON */}
          <button
            aria-label="Wishlist"
            title="View Wishlist"
            onClick={() => {
  setShowWishlistPage(true)
  setShowWishlistOnly(true)
  document.getElementById('arrivals')?.scrollIntoView({
    behavior: 'smooth',
  })
}}
          >
            <Heart
              fill={showWishlistOnly ? 'currentColor' : 'none'}
            />
          </button>

          {/* SHOPPING CART BUTTON */}
          <button
            className="cart-icon-button"
            aria-label={`Shopping bag with ${cartCount} items`}
            onClick={() => setShowCart(true)}
          >
            <ShoppingBag />
            {cartCount > 0 && (
              <span className="cart-count">{cartCount}</span>
            )}
          </button>

        </div>
      </header>



<section className="shop-showcase" id="home">
  <div className="shop-showcase-glow" />

  <div className="shop-showcase-content">
    <p className="shop-showcase-label">
      KENZUKA / THE NEW COLLECTION
    </p>

    <h1>
      WEAR
      <br />
      YOUR <span>IDENTITY.</span>
    </h1>

    <p className="shop-showcase-description">
      Not just clothing. An expression of who you are.
      <br />
      Discover your style. Make your statement.
    </p>

    <a href="#arrivals" className="shop-showcase-button">
      EXPLORE COLLECTION <ArrowUpRight size={18} />
    </a>

    <div className="shop-showcase-counter">
      <span>01</span>
      <span>â€”</span>
      <span>KENZUKA / 2026</span>
    </div>
  </div>

  <div className="shop-orbit-scene">
    <div className="shop-orbit-platform" />

    <div className="shop-orbit-ring">
      {products.slice(0, 8).map((product, index) => (
        <button
          type="button"
          className="shop-orbit-shirt"
          key={product._id}
          style={{
            '--shirt-angle': `${(index * 360) / Math.min(products.length, 8)}deg`,
          } as CSSProperties}
         onClick={() => {
  setSelectedProduct(product)
  setSelectedSize('')
  setSelectedImageIndex(0)
}}
          aria-label={`View ${product.name}`}
        >
          <img src={product.image} alt={product.name} />
          <span>{product.name}</span>
        </button>
      ))}
    </div>

    <div className="shop-orbit-caption">
      KENZUKA COLLECTION
    </div>
  </div>

  <div className="shop-showcase-bottom">
    <span>QUALITY FIRST</span>
    <span>STYLE WITHOUT LIMITS</span>
    <span>MADE FOR EVERYDAY</span>
  </div>
</section>



      <section className="benefits">
        <div>{"\u2726"} QUALITY FIRST</div>
        <div>{"\u2726"} MADE FOR EVERYDAY</div>
        <div>{"\u2726"} STYLE WITHOUT LIMITS</div>
        <div>{"\u2726"} YOUR STYLE. YOUR STORY.</div>
      </section>

      <section className="collections section" id="collections">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FIND YOUR LOOK</p>
            <h2>EXPLORE <span>COLLECTIONS.</span></h2>
          </div>
          <a href="#arrivals">VIEW ALL <ArrowUpRight size={16} /></a>
        </div>

        <div className="category-grid">
          {categories.map((category, index) => (
            <a href="#arrivals" className="category-card" key={category.name}>
              <img src={category.image} alt={category.name} />
              <div className="category-number">0{index + 1}</div>
              <div className="category-info">
                <p>{category.subtitle}</p>
                <h3>{category.name}</h3>
                <span><ArrowUpRight /></span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="arrivals section" id="arrivals">
        <div className="section-heading">
          <div>
          <p className="eyebrow">
  {showWishlistPage ? 'YOUR SAVED PICKS' : 'FRESH FROM KENZUKA'}
</p>

<h2>
  {showWishlistPage ? (
    <>MY <span>WISHLIST.</span></>
  ) : (
    <>NEW <span>ARRIVALS.</span></>
  )}
</h2>
          </div>
          <a href="#arrivals">DISCOVER MORE <ArrowUpRight size={16} /></a>
        </div>

<div className="product-grid">
  <div className="shop-controls">
  {showSearch && (
    <input
      type="text"
      className="product-search-input"
      placeholder="Search KENZUKA products..."
      value={searchTerm}
      onChange={(event) => setSearchTerm(event.target.value)}
    />
  )}

  <select
    value={selectedCategory}
    onChange={(event) => setSelectedCategory(event.target.value)}
    aria-label="Filter by category"
  >
    <option value="ALL">ALL CATEGORIES</option>
    {availableCategories.map((category) => (
      <option key={category} value={category}>
        {category}
      </option>
    ))}
  </select>

  <select
    value={sortOrder}
    onChange={(event) =>
      setSortOrder(event.target.value as 'default' | 'low-high' | 'high-low')
    }
    aria-label="Sort products by price"
  >
    <option value="default">DEFAULT SORT</option>
    <option value="low-high">PRICE: LOW TO HIGH</option>
    <option value="high-low">PRICE: HIGH TO LOW</option>
  </select>

  {showWishlistPage && (
  <button
    className="clear-wishlist-filter"
    onClick={() => {
      setShowWishlistPage(false)
      setShowWishlistOnly(false)
    }}
  >
    CONTINUE SHOPPING
  </button>
)}
</div>
  {productsLoading ? (
    <p>Loading KENZUKA collection...</p>
  ) : productsError ? (
    <p>{productsError}</p>
    ) : products.length === 0 ? (
    <p>No products available right now.</p>
  ) : filteredProducts.length === 0 ? (
    <p className="no-products-message">
      {showWishlistOnly
        ? 'Your wishlist is empty. Add your favourite products!'
        : 'No matching products found.'}
    </p>
  ) : (
    filteredProducts.map((product) => (
      <article
        className="product-card"
        key={product._id}
        onClick={() => {
          setSelectedProduct(product)
          setSelectedSize('')
        }}
        style={{ cursor: 'pointer' }}
      >
        <div className="product-image">
          <img src={product.image} alt={product.name} />
          <span className="product-tag">{product.tag}</span>

         <button
  className={`wishlist-heart ${
    wishlist.includes(product._id) ? 'wishlisted' : ''
  }`}
  aria-label={
    wishlist.includes(product._id)
      ? `Remove ${product.name} from wishlist`
      : `Add ${product.name} to wishlist`
  }
  aria-pressed={wishlist.includes(product._id)}
  onClick={(event) => {
    event.stopPropagation()
    toggleWishlist(product._id)
  }}
>
  <Heart
    size={18}
    fill={wishlist.includes(product._id) ? 'currentColor' : 'none'}
  />
</button>
        </div>

        <div className="product-info">
          <h3>{product.name}</h3>
          <p>{"\u20B9"}{product.price.toLocaleString('en-IN')}</p>
        </div>
      </article>
    ))
  )}
</div>

      </section>
      {/* FULL SCREEN PRODUCT IMAGE VIEWER */}
{isImageZoomOpen && selectedProduct && (
  <div
    className="image-zoom-overlay"
    onClick={() => setIsImageZoomOpen(false)}
  >
    <button
      className="image-zoom-close"
      onClick={() => setIsImageZoomOpen(false)}
      aria-label="Close image viewer"
    >
      <X size={28} />
    </button>

    {selectedProduct.images?.length > 1 && (
      <>
        <button
          className="image-zoom-arrow image-zoom-prev"
          onClick={(event) => {
            event.stopPropagation()
            setSelectedImageIndex((current) =>
              current === 0
                ? selectedProduct.images.length - 1
                : current - 1
            )
          }}
          aria-label="Previous image"
        >
          â€¹
        </button>

        <button
          className="image-zoom-arrow image-zoom-next"
          onClick={(event) => {
            event.stopPropagation()
            setSelectedImageIndex((current) =>
              (current + 1) % selectedProduct.images.length
            )
          }}
          aria-label="Next image"
        >
          â€º
        </button>
      </>
    )}

    <img
      className="image-zoom-full"
      src={
        selectedProduct.images?.[selectedImageIndex] ||
        selectedProduct.image
      }
      alt={selectedProduct.name}
      onClick={(event) => event.stopPropagation()}
    />
  </div>
)}
{/* PRODUCT DETAILS POPUP */}
{selectedProduct && (
  <div
    className="product-modal-overlay"
    onClick={() => setSelectedProduct(null)}
  >
    <div
      className="product-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        className="product-modal-close"
        onClick={() => setSelectedProduct(null)}
        aria-label="Close product details"
      >
        <X size={24} />
      </button>
<div className="product-modal-image">
  <img
  src={
    selectedProduct.images?.[selectedImageIndex] ||
    selectedProduct.image
  }
  alt={selectedProduct.name}
  onClick={() => setIsImageZoomOpen(true)}
  title="Click to view full screen"
/>

  {selectedProduct.images?.length > 1 && (
    <div className="product-image-thumbnails">
      {selectedProduct.images.map((image, index) => (
        <button
          key={`${image}-${index}`}
          type="button"
          className={selectedImageIndex === index ? 'active' : ''}
          onClick={() => setSelectedImageIndex(index)}
          aria-label={`View product image ${index + 1}`}
        >
          <img src={image} alt={`${selectedProduct.name} view ${index + 1}`} />
        </button>
      ))}
    </div>
  )}
</div>

      <div className="product-modal-info">
        <p className="eyebrow">KENZUKA COLLECTION</p>

        <h2>{selectedProduct.name}</h2>

        <h3>{"\u20B9"}{selectedProduct.price.toLocaleString('en-IN')}</h3>

        <p className="size-heading">SELECT YOUR SIZE</p>

        <div className="size-options">
         {selectedProduct.sizes.map((size) => (
            <button
              key={size}
              className={selectedSize === size ? 'selected' : ''}
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </button>
          ))}
        </div>

      
<button
  className="add-to-bag-button"
  disabled={!selectedSize}
  onClick={() => {
    if (!selectedProduct || !selectedSize) return

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) =>
          item.product.name === selectedProduct.name &&
          item.size === selectedSize
      )

      if (existingItem) {
        return currentCart.map((item) =>
          item.product.name === selectedProduct.name &&
          item.size === selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [
        ...currentCart,
        {
          product: selectedProduct,
          size: selectedSize,
          quantity: 1,
        },
      ]
    })

    setSelectedProduct(null)
    setSelectedSize('')
  }}
>
  {selectedSize ? 'ADD TO BAG' : 'SELECT A SIZE'}
  <ShoppingBag size={18} />
</button>

<button
  className="buy-now-button"
  disabled={!selectedSize}
  onClick={() => {
    if (!selectedProduct || !selectedSize) return

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) =>
          item.product.name === selectedProduct.name &&
          item.size === selectedSize
      )

      if (existingItem) {
        return currentCart.map((item) =>
          item.product.name === selectedProduct.name &&
          item.size === selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [
        ...currentCart,
        {
          product: selectedProduct,
          size: selectedSize,
          quantity: 1,
        },
      ]
    })

    setSelectedProduct(null)
    setSelectedSize('')
    setShowCart(false)
    setShowCheckout(true)
  }}
>
  BUY NOW
</button>

<p className="product-modal-note">
  STYLE THAT MOVES WITH YOU.
</p>
      </div>
    </div>
  </div>
)}

{/* SHOPPING CART PANEL */}
{showCart && (
  <div
    className="cart-overlay"
    onClick={() => setShowCart(false)}
  >
    <div
      className="cart-panel"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="cart-header">
        <h2>YOUR BAG ({cartCount})</h2>

        <button
          onClick={() => setShowCart(false)}
          aria-label="Close cart"
        >
          <X size={24} />
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <ShoppingBag size={40} />
          <h3>Your bag is empty</h3>
          <p>Discover something you love.</p>
          <button onClick={() => setShowCart(false)}>
            CONTINUE SHOPPING
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item, index) => (
              <div className="cart-item" key={`${item.product.name}-${item.size}`}>
                <img
                  src={item.product.image}
                  alt={item.product.name}
                />

                <div className="cart-item-details">
                  <h3>{item.product.name}</h3>
                  <p>Size: {item.size}</p>
                  <p>
                    {"\u20B9"}{item.product.price.toLocaleString('en-IN')}
                  </p>

                  <div className="cart-quantity">
                    <button
                      onClick={() => {
                        setCart((currentCart) =>
                          currentCart
                            .map((cartItem, i) =>
                              i === index
                                ? {
                                    ...cartItem,
                                    quantity: cartItem.quantity - 1,
                                  }
                                : cartItem
                            )
                            .filter((cartItem) => cartItem.quantity > 0)
                        )
                      }}
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() => {
                        setCart((currentCart) =>
                          currentCart.map((cartItem, i) =>
                            i === index
                              ? {
                                  ...cartItem,
                                  quantity: cartItem.quantity + 1,
                                }
                              : cartItem
                          )
                        )
                      }}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="cart-remove"
                    onClick={() =>
                      setCart((currentCart) =>
                        currentCart.filter((_, i) => i !== index)
                      )
                    }
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <div>
              <span>Subtotal</span>
              <strong>{"\u20B9"}{cartSubtotal.toLocaleString('en-IN')}</strong>
            </div>

            <p>Shipping charges calculated at checkout.</p>

            <button
              className="checkout-button"
              onClick={() => {
                setShowCart(false)
                setShowCheckout(true)
              }}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </>
      )}
    </div>
  </div>
)}
     {/* CUSTOM DESIGN SECTION */}
      <section className="design-studio" id="custom-design">
        <div className="design-studio-image">
          <img
            src="https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=1200"
            alt="Custom fashion styling"
          />
          <span className="design-image-label">
            YOUR STYLE. YOUR RULES.
          </span>
        </div>

        <div className="design-studio-content">
          <p className="eyebrow">MADE TO EXPRESS YOU</p>

          <h2>
            YOUR IDEA.
            <br />
            YOUR <span>STYLE.</span>
            <br />
            YOUR KENZUKA.
          </h2>

          <p className="design-description">
            Got a style in mind? Tell us what you imagine.
            From unique looks to your own clothing ideas,
            let's make something that feels like you.
          </p>

          <div className="design-studio-actions">
            <a
              href="https://wa.me/91YOURNUMBER"
              target="_blank"
              rel="noreferrer"
            >
              DISCUSS YOUR DESIGN <ArrowUpRight size={18} />
            </a>

            <a
              href="https://instagram.com/YOURUSERNAME"
              target="_blank"
              rel="noreferrer"
              className="design-instagram-link"
            >
              CONNECT ON INSTAGRAM <ArrowUpRight size={18} />
            </a>
          </div>

          <p className="design-note">
            NO LIMITS. JUST YOUR IMAGINATION.
          </p>
        </div>
      </section>

    
      <section className="brand-story" id="about">
        <div className="story-image">
          <img
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1100"
            alt="Fashion editorial"
          />
        </div>

        <div className="story-content">
          <p className="eyebrow">MORE THAN JUST CLOTHING</p>
          <h2>WEAR YOUR<br /><span>OWN STORY.</span></h2>
          <p>
            KENZUKA is about individuality, confidence and the freedom
            to express who you are. No rules. No limits. Just your style.
          </p>
          <a href="#collections">
            DISCOVER KENZUKA <ArrowUpRight />
          </a>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-main">
          <img src="/kenzuka-logo.jpeg" alt="KENZUKA" />
          <p>STYLE THAT MOVES WITH YOU.</p>
        </div>
        <div className="footer-links">
          <a href="#home">HOME</a>
          <a href="#collections">COLLECTIONS</a>
          <a href="#arrivals">SHOP</a>
          <a href="#about">ABOUT</a>
        </div>
        <div className="footer-social">
          <Camera />
          <span>FOLLOW OUR JOURNEY</span>
        </div>
        <div className="footer-bottom">
          <span>{"\u00A9"} 2026 KENZUKA. ALL RIGHTS RESERVED.</span>
          <span>BUILT FOR INDIVIDUALITY.</span>
        </div>
      </footer>
            {/* ACCOUNT MODAL */}
      {showAccount && (
        <div
          className="account-overlay"
          onClick={() => setShowAccount(false)}
        >
          <div
            className="account-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="account-close"
              onClick={() => setShowAccount(false)}
              aria-label="Close account"
            >
              <X />
            </button>

          {currentUser ? (
  showOrders ? (
    <div className="account-orders">
      <button
        className="orders-back"
        onClick={() => setShowOrders(false)}
      >
        ? BACK TO ACCOUNT
      </button>

      <p className="eyebrow">KENZUKA ACCOUNT</p>
      <h2>MY ORDERS.</h2>
      <p className="orders-subtitle">
        Your purchases and delivery updates.
      </p>

      {ordersLoading ? (
        <p className="orders-message">Loading your orders...</p>
      ) : ordersError ? (
        <p className="account-error">{ordersError}</p>
      ) : customerOrders.length === 0 ? (
        <div className="orders-empty">
          <p>NO ORDERS YET.</p>
          <span>Your orders will appear here after checkout.</span>
        </div>
      ) : (
        <div className="orders-list">
          {customerOrders.map((order) => (
            <article className="customer-order-card" key={order._id}>
              <div className="customer-order-heading">
                <div>
                  <span className="order-label">ORDER ID</span>
                  <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                </div>

                <span className={`order-status status-${order.orderStatus.toLowerCase()}`}>
                  {order.orderStatus}
                </span>
              </div>

              <p className="order-date">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>

              <div className="customer-order-items">
                {order.orderItems.map((item, index) => {
                  const productImage =
                    typeof item.product === 'object' && item.product
                      ? item.product.images?.[0]
                      : undefined

                  return (
                    <div
                      className="customer-order-item"
                      key={`${order._id}-${index}`}
                    >
                      <img
                        src={productImage || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200'}
                        alt={item.name}
                      />

                      <div className="customer-order-item-info">
                        <strong>{item.name}</strong>
                        <span>Size: {item.size}</span>
                        <span>Qty: {item.quantity}</span>
                      </div>

                      <strong className="order-item-price">
                        {"\u20B9"}{(item.price * item.quantity).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  )
                })}
              </div>

              <div className="customer-order-details">
                <span>Payment method</span>
                <strong>{order.paymentMethod}</strong>

                <span>Payment status</span>
                <strong>{order.paymentStatus}</strong>

                <span>Delivery fee</span>
                <strong>{"\u20B9"}{order.deliveryFee}</strong>
              </div>

              <div className="customer-order-total">
                <span>TOTAL</span>
                <strong>
                  {"\u20B9"}{order.totalPrice.toLocaleString('en-IN')}
                </strong>
              </div>

              <div className="order-shipping">
                <span>DELIVERING TO</span>
                <p>{order.shippingAddress.fullName}</p>
                <p>
                  {order.shippingAddress.address}, {order.shippingAddress.city}
                </p>
                <p>PIN: {order.shippingAddress.pincode}</p>
              </div>
            </article>
          ))}
           </div>
      )}
    </div>
  ) : accountView === 'profile' ? (
    <div className="account-profile">
      <button className="orders-back" onClick={() => {
        setAccountView('home')
        setAccountActionError('')
        setAccountActionSuccess('')
      }}>
        ? BACK TO ACCOUNT
      </button>

      <p className="eyebrow">KENZUKA ACCOUNT</p>
      <h2>EDIT PROFILE.</h2>

      <form className="account-form" onSubmit={(event) => {
        event.preventDefault()
        void handleSaveProfile()
      }}>
        <label htmlFor="profile-name">FULL NAME</label>
        <input
          id="profile-name"
          value={profileName}
          onChange={(event) => setProfileName(event.target.value)}
          minLength={2}
          maxLength={80}
          required
        />

        <label htmlFor="profile-email">EMAIL ADDRESS</label>
        <input
          id="profile-email"
          type="email"
          value={profileEmail}
          onChange={(event) => setProfileEmail(event.target.value)}
          required
        />

        {accountActionError && <p className="account-error">{accountActionError}</p>}

        <button className="account-submit" type="submit" disabled={accountActionLoading}>
          {accountActionLoading ? 'SAVING...' : 'SAVE PROFILE'}
        </button>
      </form>
    </div>
  ) : accountView === 'address' ? (
    <div className="account-profile">
      <button className="orders-back" onClick={() => {
        setAccountView('home')
        setAccountActionError('')
        setAccountActionSuccess('')
      }}>
        ? BACK TO ACCOUNT
      </button>

      <p className="eyebrow">DELIVERY DETAILS</p>
      <h2>SAVED ADDRESS.</h2>

      <form className="account-form" onSubmit={(event) => {
        event.preventDefault()
        void handleSaveAddress()
      }}>
        <label htmlFor="saved-fullname">FULL NAME</label>
        <input
          id="saved-fullname"
          value={savedAddressForm.fullName}
          onChange={(event) => setSavedAddressForm({
            ...savedAddressForm,
            fullName: event.target.value,
          })}
          maxLength={80}
          required
        />

        <label htmlFor="saved-address">HOUSE / STREET / AREA</label>
        <textarea
          id="saved-address"
          value={savedAddressForm.address}
          onChange={(event) => setSavedAddressForm({
            ...savedAddressForm,
            address: event.target.value,
          })}
          maxLength={200}
          required
        />

        <label htmlFor="saved-city">CITY</label>
        <input
          id="saved-city"
          value={savedAddressForm.city}
          onChange={(event) => setSavedAddressForm({
            ...savedAddressForm,
            city: event.target.value,
          })}
          maxLength={80}
          required
        />

        <label htmlFor="saved-pincode">PINCODE</label>
        <input
          id="saved-pincode"
          value={savedAddressForm.pincode}
          onChange={(event) => setSavedAddressForm({
            ...savedAddressForm,
            pincode: event.target.value,
          })}
          pattern="[0-9]{6}"
          maxLength={6}
          required
        />

        <label htmlFor="saved-phone">PHONE NUMBER</label>
        <input
          id="saved-phone"
          type="tel"
          value={savedAddressForm.phone}
          onChange={(event) => setSavedAddressForm({
            ...savedAddressForm,
            phone: event.target.value,
          })}
          pattern="[6-9][0-9]{9}"
          maxLength={10}
          required
        />

        {accountActionError && <p className="account-error">{accountActionError}</p>}

        <button className="account-submit" type="submit" disabled={accountActionLoading}>
          {accountActionLoading ? 'SAVING...' : 'SAVE ADDRESS'}
        </button>
      </form>
    </div>
  ) : (
    <div className="account-profile">
      <p className="eyebrow">KENZUKA ACCOUNT</p>

      <h2>WELCOME BACK.</h2>

      <div className="account-user-icon">
        <UserRound size={30} />
      </div>

      <h3>{currentUser.name}</h3>
      <p>{currentUser.email}</p>

      <span className="account-role">
        {currentUser.role.toUpperCase()}
      </span>

      {accountActionSuccess && (
        <p className="orders-message">{accountActionSuccess}</p>
      )}

      {currentUser.role === 'admin' && (
        <p className="account-admin-note">
          Administrator account detected.
        </p>
      )}

      {currentUser.role === 'customer' && (
        <>
          <button className="account-submit" onClick={() => void handleViewOrders()}>
            MY ORDERS
          </button>

          <button className="account-submit" onClick={() => {
            setAccountView('profile')
            setProfileName(currentUser.name)
            setProfileEmail(currentUser.email)
            setAccountActionError('')
            setAccountActionSuccess('')
          }}>
            EDIT PROFILE
          </button>

          <button className="account-submit" onClick={() => {
            setAccountView('address')
            setAccountActionError('')
            setAccountActionSuccess('')
          }}>
            SAVED ADDRESS
          </button>
        </>
      )}

      <button className="account-submit" onClick={handleLogout}>
        LOG OUT
      </button>
       </div>
  )
  ) : (
    <>
      <p className="eyebrow">STYLE THAT MOVES WITH YOU</p>

<h2>
  {authStep === 'name'
    ? 'ALMOST THERE.'
    : authStep === 'otp'
      ? 'CHECK YOUR EMAIL.'
      : authStep === 'password'
        ? 'WELCOME BACK.'
        : 'WELCOME TO KENZUKA.'}
</h2>

<p className="account-description">
  {authStep === 'email'
    ? 'Enter your email to continue.'
    : authStep === 'otp'
      ? 'Enter the 6-digit verification code sent to your email.'
      : authStep === 'password'
        ? 'Enter your admin password to continue.'
        : 'Enter your name to complete your account.'}
</p>

<form
  className="account-form"
  onSubmit={(event) => {
    event.preventDefault()
    void handleAuthSubmit()
  }}
>
  {authStep === 'name' && (
    <>
      <label htmlFor="auth-name">FULL NAME</label>
      <input
        id="auth-name"
        type="text"
        placeholder="Enter your full name"
        value={authName}
        onChange={(event) => setAuthName(event.target.value)}
        minLength={2}
        maxLength={80}
        required
      />
    </>
  )}

  <label htmlFor="auth-email">EMAIL ADDRESS</label>
  <input
    id="auth-email"
    type="email"
    placeholder="Enter your email"
    value={authEmail}
    onChange={(event) => setAuthEmail(event.target.value)}
    readOnly={authStep !== 'email'}
    required
  />

  {authStep === 'otp' && (
    <>
      <label htmlFor="auth-otp">EMAIL VERIFICATION CODE</label>
      <input
        id="auth-otp"
        type="text"
        inputMode="numeric"
        placeholder="Enter your 6-digit OTP"
        value={authOtp}
        onChange={(event) =>
          setAuthOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
        }
        pattern="[0-9]{6}"
        maxLength={6}
        required
      />
    </>
  )}

  {authStep === 'password' && (
    <>
      <label htmlFor="auth-password">ADMIN PASSWORD</label>
      <input
        id="auth-password"
        type="password"
        placeholder="Enter your admin password"
        value={authPassword}
        onChange={(event) => setAuthPassword(event.target.value)}
        required
      />
    </>
  )}

  {authError && (
    <p className="account-error">{authError}</p>
  )}

  <button
    className="account-submit"
    type="submit"
    disabled={authLoading}
  >
    {authLoading
      ? 'PLEASE WAIT...'
      : authStep === 'email'
        ? 'CONTINUE'
        : authStep === 'otp'
          ? 'VERIFY OTP'
          : authStep === 'password'
            ? 'SIGN IN'
            : 'CREATE ACCOUNT'}
  </button>
</form>

{authStep !== 'email' && (
  <p className="account-switch">
    Wrong email or want to start again?

    <button
      type="button"
      onClick={() => {
        setAuthStep('email')
        setAuthName('')
        setAuthPassword('')
        setAuthOtp('')
        setRegistrationToken('')
        setAuthError('')
      }}
    >
      CHANGE EMAIL
    </button>
  </p>
)}
            </>
          )}
          </div>
        </div>
      )}
    </main>
  )
}

export default App
