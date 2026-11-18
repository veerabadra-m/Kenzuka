
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ArrowUpRight,
  Heart,
  UserRound,
} from 'lucide-react'

type StoreNavbarProps = {
  menuOpen: boolean
  cartCount: number
  showWishlistOnly: boolean
  isAdmin: boolean
  onAdminDashboard: () => void
  onMenuToggle: () => void
  onNavigate: (
    section: 'home' | 'arrivals' | 'products' | 'custom-design' | 'about'
  ) => void
  onSearch: () => void
  showSearchButton: boolean
  onAccount: () => void
  onWishlist: () => void
  onCart: () => void
}

export default function StoreNavbar({
  menuOpen,
  cartCount,
  showWishlistOnly,
  isAdmin,
  onAdminDashboard,
  onMenuToggle,
  onNavigate,
  onSearch,
  showSearchButton,
  onAccount,
  onWishlist,
  onCart,
}: StoreNavbarProps) {
  return (
    <>
      <div className="announcement">
        <span>
          KENZUKA | QUALITY FIRST | MADE FOR EVERYDAY | STYLE WITHOUT LIMITS
        </span>
        <span>
          DISCOVER YOUR NEXT LOOK <ArrowUpRight size={13} />
        </span>
      </div>

      <header className="navbar">
        <button
          className="mobile-menu"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <a
          href="/#home"
          className="brand-logo"
          onClick={(event) => {
            event.preventDefault()
            onNavigate('home')
          }}
        >
          <img src="/kenzuka-logo.jpeg" alt="KENZUKA" />
        </a>

        <nav className={menuOpen ? 'nav-links active' : 'nav-links'}>
          <a href="/#home" onClick={(event) => {
            event.preventDefault()
            onNavigate('home')
          }}>
            HOME
          </a>

          <a href="/#arrivals" onClick={(event) => {
            event.preventDefault()
            onNavigate('arrivals')
          }}>
            NEW ARRIVALS
          </a>

          <a href="/products" onClick={(event) => {
            event.preventDefault()
            onNavigate('products')
          }}>
            ALL PRODUCTS
          </a>

          <a href="/#custom-design" onClick={(event) => {
            event.preventDefault()
            onNavigate('custom-design')
          }}>
            CUSTOM DESIGN
          </a>

          <a href="/#about" onClick={(event) => {
            event.preventDefault()
            onNavigate('about')
          }}>
            OUR STORY
          </a>

          {isAdmin && (
            <a href="/admin" onClick={(event) => {
              event.preventDefault()
              onAdminDashboard()
            }}>
              ADMIN DASHBOARD
            </a>
          )}
        </nav>

        <div className="nav-actions">
          {showSearchButton && (
            <button
              aria-label="Search products"
              onClick={onSearch}
            >
              <Search />
            </button>
          )}

          <button
            aria-label="My account"
            onClick={onAccount}
          >
            <UserRound />
          </button>

          <button
            aria-label="Wishlist"
            title="View Wishlist"
            onClick={onWishlist}
          >
            <Heart
              fill={showWishlistOnly ? 'currentColor' : 'none'}
            />
          </button>

          <button
            className="cart-icon-button"
            aria-label={`Shopping bag with ${cartCount} items`}
            onClick={onCart}
          >
            <ShoppingBag />

            {cartCount > 0 && (
              <span className="cart-count">{cartCount}</span>
            )}
          </button>
        </div>
      </header>
    </>
  )
}

