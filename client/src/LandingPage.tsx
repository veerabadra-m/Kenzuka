
import { useState } from 'react'
import { ArrowUpRight, Camera, Menu, X } from 'lucide-react'
import './LandingPage.css'
import Kenzuka3DScene from './Kenzuka3DScene'

interface LandingPageProps {
  onEnter: () => void
}

function LandingPage({ onEnter }: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className="kenzuka-landing">

      <div className="sketch-background">
        <div className="sketch-glow" />
        <div className="background-caption">
          KENZUKA â€” BEYOND THE ORDINARY
        </div>
        <div className="background-number">2026</div>
      </div>

      <header className="landing-header">
        <a href="#landing" className="landing-logo">
          <img src="/kenzuka-logo.jpeg" alt="KENZUKA" />
        </a>

        <div className="landing-header-right">
          <span>INDEPENDENT FASHION LABEL</span>
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

        <div className="landing-side-text left-side">
          <span>01 / 04</span>
          <span>FASHION WITHOUT LIMITS</span>
        </div>

        
<div className="card-scene">
  <div className="card-shadow" />
  <Kenzuka3DScene />
</div>
        <div className="landing-side-text right-side">
          <span>DESIGNED TO STAND OUT</span>
          <span>INDIA / WORLDWIDE</span>
        </div>

      </section>

      <footer className="landing-footer">
        <div className="landing-footer-left">
          <span>STRENGTH IN INDIVIDUALITY.</span>
          <span>YOUR STYLE. YOUR STORY.</span>
        </div>

        <button className="enter-kenzuka" onClick={onEnter}>
          ENTER KENZUKA <ArrowUpRight size={19} />
        </button>

        <div className="landing-footer-right">
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
            <Camera size={17} />
          </a>
          <span>FOLLOW THE MOVEMENT</span>
        </div>
      </footer>

      <div className={`landing-menu ${menuOpen ? 'menu-visible' : ''}`}>
        <button onClick={() => setMenuOpen(false)} className="menu-close">
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
