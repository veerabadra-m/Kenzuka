import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { ApiProduct } from './services/api'
import './ProductsPage.css'

type StoreProduct = ApiProduct & {
  image: string
  tag: string
}

type ProductsPageProps = {
  products: StoreProduct[]
  loading: boolean
  error: string
}

const categories = ['ALL', 'OVERSIZED T-SHIRT', 'CAP', 'JEANS PANT']
const PRODUCTS_PER_PAGE = 6

const getProductSlug = (product: StoreProduct) => {
  const nameSlug = product.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return `${nameSlug}-${product._id}`
}

export default function ProductsPage({
  products,
  loading,
  error,
}: ProductsPageProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [category, setCategory] = useState(() => {
    const requestedCategory = searchParams.get('category')?.toUpperCase()
    return requestedCategory && categories.includes(requestedCategory)
      ? requestedCategory
      : 'ALL'
  })

  const [sort, setSort] = useState('default')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory =
          category === 'ALL' || product.category === category

        const matchesSearch = product.name
          .toLowerCase()
          .includes(search.trim().toLowerCase())

        return matchesCategory && matchesSearch
      })
      .sort((a, b) => {
        if (sort === 'low-high') return a.price - b.price
        if (sort === 'high-low') return b.price - a.price
        return 0
      })
  }, [products, category, sort, search])

  useEffect(() => {
    setCurrentPage(1)
  }, [category, sort, search])

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE,
  )

  return (
    <main className="catalogue-page">
      <header className="catalogue-header">
        <button
          className="catalogue-back"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={17} />
          BACK TO HOME
        </button>
      </header>

      <section className="catalogue-intro">
        <p className="eyebrow">KENZUKA / SHOP</p>
        <h1>ALL <span>PRODUCTS.</span></h1>
        <p>Everyday essentials. Made to stand apart.</p>
        <div className="catalogue-count">
          {loading ? 'LOADING COLLECTION...' : `${filteredProducts.length} PRODUCTS`}
        </div>
      </section>

      <section className="catalogue-content">
        <div className="catalogue-toolbar">
          <div className="catalogue-categories">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? 'active' : ''}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="catalogue-tools">
            <label className="catalogue-search">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="SEARCH PRODUCTS"
              />
            </label>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Sort products"
            >
              <option value="default">FEATURED</option>
              <option value="low-high">PRICE: LOW TO HIGH</option>
              <option value="high-low">PRICE: HIGH TO LOW</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="catalogue-message">LOADING KENZUKA COLLECTION...</p>
        ) : error ? (
          <p className="catalogue-message">{error}</p>
        ) : filteredProducts.length === 0 ? (
          <p className="catalogue-message">NO PRODUCTS FOUND IN THIS COLLECTION.</p>
        ) : (
          <>
            <div className="catalogue-grid">
              {currentProducts.map((product) => (
                <article
                  className="catalogue-card"
                  key={product._id}
                  onClick={() => navigate(`/product/${getProductSlug(product)}`)}
                >
                  <div className="catalogue-card-image">
                    <img src={product.image} alt={product.name} />
                    <span>{product.tag}</span>
                    <div className="catalogue-card-arrow">
                      <ArrowUpRight size={19} />
                    </div>
                  </div>

                  <div className="catalogue-card-info">
                    <div>
                      <p>{product.category}</p>
                      <h2>{product.name}</h2>
                    </div>
                    <strong>₹{product.price.toLocaleString('en-IN')}</strong>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="catalogue-pagination" aria-label="Product pages">
                <button
                  className="pagination-arrow"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                  PREVIOUS
                </button>

                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      className={currentPage === page ? 'active' : ''}
                      onClick={() => setCurrentPage(page)}
                      aria-label={`Go to page ${page}`}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  className="pagination-arrow"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  NEXT
                  <ChevronRight size={18} />
                </button>
              </nav>
            )}

            <p className="catalogue-page-count">
              SHOWING {startIndex + 1}–{Math.min(startIndex + PRODUCTS_PER_PAGE, filteredProducts.length)} OF {filteredProducts.length} PRODUCTS
            </p>
          </>
        )}
      </section>

      <footer className="catalogue-footer">
        KENZUKA. <span>STRENGTH IN SIMPLICITY.</span>
      </footer>
    </main>
  )
}


