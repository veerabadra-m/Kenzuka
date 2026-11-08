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
    alert('Delivery details validated! Payment integration is our next step.')
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
              placeholder="Enter your email"
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              required
            />

            <label>PHONE NUMBER</label>
            <input
  type="tel"
  placeholder="10-digit mobile number"
  value={customerPhone}
  onChange={(event) =>
    setCustomerPhone(event.target.value.replace(/\D/g, '').slice(0, 10))
  }
  pattern="[6-9][0-9]{9}"
  title="Enter a valid 10-digit Indian mobile number"
  maxLength={10}
  required
/>
            <label>DELIVERY ADDRESS</label>
            <textarea
              placeholder="House number, street, area..."
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
  onChange={(event) =>
    setCustomerPincode(event.target.value.replace(/\D/g, '').slice(0, 6))
  }
  pattern="[0-9]{6}"
  title="Enter a valid 6-digit pincode"
  maxLength={6}
  required
/>
              </div>
            </div>
          </form>
        </section>

        <aside className="checkout-order-section">
          <p className="eyebrow">KENZUKA COLLECTION</p>
          <h2>YOUR ORDER</h2>

          {cart.map((item, index) => (
            <div className="checkout-order-item" key={`${item.product.name}-${item.size}-${index}`}>
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
            <span>Subtotal</span>
            <strong>₹{cartSubtotal.toLocaleString('en-IN')}</strong>
          </div>

          <p className="checkout-shipping-note">
            Shipping charges will be calculated separately.
          </p>

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



