import { useState } from 'react'
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ArrowUpRight,
  Camera,
  Heart,
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

const products = [
  {
    name: 'Essential Oversized Tee',
    price: 899,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700',
    tag: 'BESTSELLER',
  },
  {
    name: 'Urban Street Jacket',
    price: 1999,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700',
    tag: 'NEW ARRIVAL',
  },
  {
    name: 'Classic Streetwear',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=700',
    tag: 'TRENDING',
  },
  {
    name: 'Everyday Essential',
    price: 999,
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=700',
    tag: 'POPULAR',
  },
]
function App() {
  const [showShop, setShowShop] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [orderCopied, setOrderCopied] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [orderDate, setOrderDate] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('UPI')
  const [customerName, setCustomerName] = useState('')
const [customerEmail, setCustomerEmail] = useState('')
const [customerPhone, setCustomerPhone] = useState('')
const [customerAddress, setCustomerAddress] = useState('')
const [customerCity, setCustomerCity] = useState('')
const [customerPincode, setCustomerPincode] = useState('')

  const [selectedProduct, setSelectedProduct] = useState<
    (typeof products)[number] | null
  >(null)

  const [selectedSize, setSelectedSize] = useState('')

  const [cart, setCart] = useState<{
    product: (typeof products)[number]
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
  {orderCopied ? 'COPIED ✓' : 'COPY ORDER ID'}
</button>

        <p className="eyebrow">THANK YOU FOR CHOOSING KENZUKA</p>
        <h2>THANK YOU FOR YOUR ORDER!</h2>

        <p className="confirmation-message">
          Your demo checkout is complete. No payment has been processed
          and no real order has been placed.
        </p>

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
            Demo only — payment processing is not connected yet.
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
                {item.product.name} ({item.size}) × {item.quantity}
              </span>
              <strong>
                ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
              </strong>
            </div>
          ))}

          <div className="checkout-total">
            <span>Total Amount</span>
            <strong>₹{cartSubtotal.toLocaleString('en-IN')}</strong>
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
          CONTINUE SHOPPING →
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
        ← BACK TO DELIVERY DETAILS
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
                  setSelectedPaymentMethod(event.target.value)
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
                  setSelectedPaymentMethod(event.target.value)
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
                  setSelectedPaymentMethod(event.target.value)
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
    <button
  className="checkout-button"
  onClick={() => {
    const now = new Date()

    const newOrderId = `KEN-${now.getTime()}`
    setOrderId(newOrderId)

    setOrderDate(
      now.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    )

    setOrderCopied(false)
    setShowPayment(false)
    setShowConfirmation(true)
  }}
>
    PLACE DEMO ORDER →
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
                ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        ))}

        <div className="checkout-total">
          <span>Total Amount</span>
          <strong>₹{cartSubtotal.toLocaleString('en-IN')}</strong>
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
        ← BACK TO SHOPPING
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
                  ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>
          ))}

          <div className="checkout-total">
            <span>Total Amount</span>
            <strong>₹{cartSubtotal.toLocaleString('en-IN')}</strong>
          </div>

          <button
            className="checkout-button"
            type="submit"
            form="checkout-form"
          >
            CONTINUE TO PAYMENT →
          </button>
        </aside>
      </div>
    </main>
  )
}

return (
    <main className="website">

      <div className="announcement">
        <span>KENZUKA â€” STYLE THAT MOVES WITH YOU.</span>
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
  <button aria-label="Search">
    <Search />
  </button>

  <button aria-label="Wishlist">
    <Heart />
  </button>

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

      <section className="hero" id="home">
        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=2000"
            alt="KENZUKA fashion campaign"
          />
        </div>

        <div className="hero-overlay" />

        <div className="hero-content">
          <p className="hero-label">THE NEW GENERATION OF STYLE</p>
          <h1>
            NOT MADE
            <br />
            TO <span>BLEND.</span>
          </h1>
          <p className="hero-description">
            Express yourself. Break the ordinary.
            <br />
            Discover fashion that speaks your language.
          </p>
          <a href="#arrivals" className="shop-button">
            EXPLORE COLLECTION <ArrowUpRight size={18} />
          </a>
        </div>

        <div className="hero-bottom">
          <span>KENZUKA / EST. 2026</span>
          <span>STYLE HAS NO RULES.</span>
        </div>

        <div className="hero-index">01 â€” 04</div>
      </section>

      <section className="benefits">
        <div>âœ¦ QUALITY FIRST</div>
        <div>âœ¦ MADE FOR EVERYDAY</div>
        <div>âœ¦ STYLE WITHOUT LIMITS</div>
        <div>âœ¦ YOUR STYLE. YOUR STORY.</div>
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
            <p className="eyebrow">FRESH FROM KENZUKA</p>
            <h2>NEW <span>ARRIVALS.</span></h2>
          </div>
          <a href="#arrivals">DISCOVER MORE <ArrowUpRight size={16} /></a>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <article
  className="product-card"
  key={product.name}
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
  aria-label={`Add ${product.name} to wishlist`}
  onClick={(event) => event.stopPropagation()}
>
                  <Heart size={18} />
                </button>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
             <p>₹{product.price.toLocaleString('en-IN')}</p>
              </div>
            </article>
          ))}
        </div>
    
      </section>
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
          src={selectedProduct.image}
          alt={selectedProduct.name}
        />
      </div>

      <div className="product-modal-info">
        <p className="eyebrow">KENZUKA COLLECTION</p>

        <h2>{selectedProduct.name}</h2>

        <h3>₹{selectedProduct.price.toLocaleString('en-IN')}</h3>

        <p className="size-heading">SELECT YOUR SIZE</p>

        <div className="size-options">
          {['S', 'M', 'L', 'XL'].map((size) => (
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
                    ₹{item.product.price.toLocaleString('en-IN')}
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
                      −
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
              <strong>₹{cartSubtotal.toLocaleString('en-IN')}</strong>
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
          <span>Â© 2026 KENZUKA. ALL RIGHTS RESERVED.</span>
          <span>BUILT FOR INDIVIDUALITY.</span>
        </div>
      </footer>
    </main>
  )
}

export default App



