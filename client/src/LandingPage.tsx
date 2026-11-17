import { useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import type { ApiProduct } from './services/api'
import './LandingPage.css'
import Kenzuka3DScene from './Kenzuka3DScene'

type LandingProduct = ApiProduct & {
  image: string
  tag: string
}

interface LandingPageProps {
  onEnter: () => void
  products: LandingProduct[]
  onProductClick: (product: ApiProduct) => void
}

function LandingPage({ onEnter }: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className="kenzuka-landing">
      <div className="sketch-background">
        <div className="sketch-glow" />
      </div>

      <header className="landing-header">
        <a href="#landing" className="landing-logo">
          <img src="/kenzuka-logo.jpeg" alt="KENZUKA" />
        </a>

        <div className="landing-header-right">
          <button
            className="landing-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <section className="landing-stage" id="landing">
        {/* Original cube — unchanged */}
        <div className="card-scene">
          <div className="card-shadow" />
          <Kenzuka3DScene />
        </div>

      </section>

      <footer className="landing-footer">
        <button className="enter-kenzuka" onClick={onEnter}>
          ENTER KENZUKA <ArrowUpRight size={19} />
        </button>
      </footer>

      <div className={`landing-menu ${menuOpen ? 'menu-visible' : ''}`}>
        <button
          onClick={() => setMenuOpen(false)}
          className="menu-close"
          aria-label="Close menu"
        >
          <X />
        </button>

        <span>EXPLORE KENZUKA</span>

        <button onClick={() => { setMenuOpen(false); onEnter() }}>
          SHOP COLLECTION <ArrowUpRight />
        </button>

        <button onClick={() => { setMenuOpen(false); onEnter() }}>
          NEW ARRIVALS <ArrowUpRight />
        </button>

        <button onClick={() => { setMenuOpen(false); onEnter() }}>
          OUR STORY <ArrowUpRight />
        </button>
      </div>
    </main>
  )
}

export default LandingPage
