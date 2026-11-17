import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ApiProduct } from './services/api'
import './ProductDetailPage.css'

type StoreProduct = ApiProduct & {
  image: string
  tag: string
}

type ProductDetailPageProps = {
  product: StoreProduct | null
  loading: boolean
  error: string
  onAddToCart: (product: StoreProduct, size: string) => void
  onBuyNow: (product: StoreProduct, size: string) => void
}

export default function ProductDetailPage({
  product,
  loading,
  error,
  onAddToCart,
  onBuyNow,
}: ProductDetailPageProps) {
  const navigate = useNavigate()
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [addedToBag, setAddedToBag] = useState(false)

  useEffect(() => {
    setSelectedSize('')
    setSelectedImageIndex(0)
    setAddedToBag(false)
  }, [product?._id])

  if (loading) {
    return (
      <main className="product-detail-message">
        <p>LOADING PRODUCT...</p>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="product-detail-message">
        <p>{error || 'PRODUCT NOT FOUND.'}</p>
        <button onClick={() => navigate('/products')}>
          <ArrowLeft size={17} /> BACK TO COLLECTION
        </button>
      </main>
    )
  }

  const galleryImages = product.images?.length
    ? product.images
    : [product.image]

  const hasSizes = product.sizes?.length > 0
  const canPurchase = hasSizes && Boolean(selectedSize) && product.stock > 0

  const handleAddToBag = () => {
    if (!canPurchase) return
    onAddToCart(product, selectedSize)
    setAddedToBag(true)
  }

  const handleBuyNow = () => {
    if (!canPurchase) return
    onBuyNow(product, selectedSize)
  }

  return (
    <main className="product-detail-page">
      <header className="detail-header">
        <button
          className="detail-back"
          onClick={() => navigate('/products')}
        >
          <ArrowLeft size={17} />
          BACK TO COLLECTION
        </button>

        <button
          className="detail-logo"
          onClick={() => navigate('/')}
        >
          KENZUKA<span>.</span>
        </button>

        <span className="detail-header-label">PRODUCT DETAILS</span>
      </header>

      <div className="detail-breadcrumb">
        <button onClick={() => navigate('/')}>HOME</button>
        <span>/</span>
        <button onClick={() => navigate('/products')}>ALL PRODUCTS</button>
        <span>/</span>
        <span>{product.category}</span>
      </div>

      <section className="detail-layout">
        <div className="detail-gallery">
          <div className="detail-main-image">
            <img
              src={galleryImages[selectedImageIndex] || product.image}
              alt={product.name}
            />
            <span className="detail-image-count">
              {String(selectedImageIndex + 1).padStart(2, '0')} / {String(galleryImages.length).padStart(2, '0')}
            </span>
          </div>

          {galleryImages.length > 1 && (
            <div className="detail-thumbnails">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  className={selectedImageIndex === index ? 'active' : ''}
                  onClick={() => setSelectedImageIndex(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={image} alt={`${product.name} view ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-information">
          <p className="detail-eyebrow">KENZUKA / {product.category}</p>

          <h1>{product.name}</h1>

          <p className="detail-price">
            ₹{product.price.toLocaleString('en-IN')}
          </p>

          <div className="detail-divider" />

          <p className="detail-description">
            {product.description || 'Made for everyday. Designed to stand apart.'}
          </p>

          <div className="detail-stock">
            {product.stock > 0
              ? `${product.stock} IN STOCK`
              : 'CURRENTLY OUT OF STOCK'}
          </div>

          <div className="detail-divider" />

          <div className="detail-size-heading">
            <span>SELECT YOUR SIZE</span>
            {selectedSize && <span>SELECTED: {selectedSize}</span>}
          </div>

          {hasSizes ? (
            <div className="detail-size-options">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className={selectedSize === size ? 'selected' : ''}
                  onClick={() => {
                    setSelectedSize(size)
                    setAddedToBag(false)
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          ) : (
            <p className="detail-size-unavailable">
              SIZE INFORMATION IS NOT AVAILABLE.
            </p>
          )}

          <button
            className="detail-add-button"
            disabled={!canPurchase}
            onClick={handleAddToBag}
          >
            {product.stock <= 0
              ? 'OUT OF STOCK'
              : addedToBag
                ? 'ADDED TO BAG'
                : selectedSize
                  ? 'ADD TO BAG'
                  : 'SELECT A SIZE'}
            <ShoppingBag size={18} />
          </button>

          <button
            className="detail-buy-button"
            disabled={!canPurchase}
            onClick={handleBuyNow}
          >
            BUY NOW <ArrowUpRight size={18} />
          </button>

          {addedToBag && (
            <p className="detail-added-message">
              PRODUCT ADDED SUCCESSFULLY.
            </p>
          )}

          <div className="detail-bottom-note">
            <span>KENZUKA.</span>
            <span>STRENGTH IN SIMPLICITY.</span>
          </div>
        </div>
      </section>

      <footer className="detail-footer">
        KENZUKA. <span>STYLE WITHOUT LIMITS.</span>
      </footer>
    </main>
  )
}
