
import { useRef, useState } from 'react'
import { ArrowUpRight, Camera, Menu, X } from 'lucide-react'
import './LandingPage.css'

const fashionImages = [
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900',
  'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=900',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900',
]

interface LandingPageProps {
  onEnter: () => void
}

function LandingPage({ onEnter }: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)

  const rotationRef = useRef({ x: -12, y: -25 })

  const dragRef = useRef({
    active: false,
    lastX: 0,
    lastY: 0,
  })

  const applyCubeRotation = () => {
    if (!cardRef.current) return

    cardRef.current.style.transform =
      `rotateX(${rotationRef.current.x}deg) rotateY(${rotationRef.current.y}deg)`
  }

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    dragRef.current.active = true
    dragRef.current.lastX = event.clientX
    dragRef.current.lastY = event.clientY

    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.classList.add('is-dragging')
  }

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!dragRef.current.active) return

    const deltaX = event.clientX - dragRef.current.lastX
    const deltaY = event.clientY - dragRef.current.lastY

    dragRef.current.lastX = event.clientX
    dragRef.current.lastY = event.clientY

    rotationRef.current.y += deltaX * 0.7
    rotationRef.current.x -= deltaY * 0.7

    applyCubeRotation()
  }

  const handlePointerEnd = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    dragRef.current.active = false

    event.currentTarget.classList.remove('is-dragging')

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }
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

        
<div
  className="card-scene"
  onPointerDown={handlePointerDown}
  onPointerMove={handlePointerMove}
  onPointerUp={handlePointerEnd}
  onPointerCancel={handlePointerEnd}
>
  <div className="card-shadow" />
<div className="cube-tilt">
  <div className="fashion-cube" ref={cardRef}>

      {/* FRONT */}
      <div className="cube-face cube-front">
        <img src={fashionImages[0]} alt="KENZUKA fashion front" />
        <div className="cube-face-content">
  <img
    className="cube-logo"
    src="/kenzuka-logo.jpeg"
    alt="KENZUKA logo"
  />
  <span>KENZUKA / 2026</span>
          <h1>BE<br />UNIQUE.</h1>
          <span>COLLECTION 001</span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="cube-face cube-right">
        <img src={fashionImages[1]} alt="KENZUKA fashion right" />
        <div className="cube-label">THE NEW GENERATION</div>
      </div>

      {/* BACK */}
      <div className="cube-face cube-back">
        <img src={fashionImages[2]} alt="KENZUKA fashion back" />
        <div className="cube-label">STYLE HAS NO RULES.</div>
      </div>

      {/* LEFT */}
      <div className="cube-face cube-left">
        <img src={fashionImages[3]} alt="KENZUKA fashion left" />
        <div className="cube-label">DRESS DIFFERENT.</div>
      </div>

      {/* TOP */}
      <div className="cube-face cube-top">
        <span>KENZUKA</span>
      </div>

      {/* BOTTOM */}
      <div className="cube-face cube-bottom">
        <span>EST. 2026</span>
      </div>

    </div>
  </div>
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

