import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useAnimate, useInView, useReducedMotion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { photos } from '../data/photos'

const REGIONS = ['Europe', 'Asia', 'America']

// Frames on the strip load small thumbnails; the lightbox loads the original.
const thumbOf = (src) => src.replace('/img/fun/', '/img/fun/thumbs/')
// "Hallstatt, Austria" → "Hallstatt" for the film's edge print
const edgeName = (location) => location.split(',')[0]

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(query).matches
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])
  return matches
}

// ── Lightbox ─────────────────────────────────────────────────────
function Lightbox({ photos, index, onClose, onPrev, onNext }) {
  const photo = photos[index]

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onPrev, onNext, onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(14,14,12,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Image */}
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', maxWidth: '90vw', maxHeight: '88vh' }}
      >
        <img
          src={photo.src}
          alt={photo.location}
          style={{ maxWidth: '90vw', maxHeight: '82vh', objectFit: 'contain', borderRadius: 4, display: 'block' }}
        />
        <p style={{
          textAlign: 'center', marginTop: 10,
          fontFamily: "'DM Mono', monospace", fontSize: 11,
          color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em',
        }}>
          {photo.location}
        </p>
      </motion.div>

      {/* Controls */}
      <button onClick={(e) => { e.stopPropagation(); onPrev() }} style={navBtnStyle('left')} aria-label="Previous photo">
        <ChevronLeft size={20} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onNext() }} style={navBtnStyle('right')} aria-label="Next photo">
        <ChevronRight size={20} />
      </button>
      <button onClick={onClose} aria-label="Close" style={{
        position: 'absolute', top: '1.5rem', right: '1.5rem',
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'rgba(255,255,255,0.6)',
      }}>
        <X size={20} />
      </button>

      {/* Counter */}
      <div style={{
        position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        fontFamily: "'DM Mono', monospace", fontSize: 10,
        color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em',
      }}>
        {index + 1} / {photos.length}
      </div>
    </motion.div>
  )
}

function navBtnStyle(side) {
  return {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    [side]: '1.5rem',
    background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
    width: 40, height: 40, cursor: 'pointer', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
}

// ── Film pieces ──────────────────────────────────────────────────
// A blank stretch of film: perforated edges with nothing exposed.
function BlankFilm({ className, label }) {
  return (
    <div className={`film-cell ${className}`} aria-hidden="true">
      <div className="film-band film-band--top" />
      <div className="film-gate" />
      <div className="film-band film-band--bottom">{label && <span>{label}</span>}</div>
    </div>
  )
}

function Canister() {
  return (
    <div className="film-canister" aria-hidden="true">
      <div className="film-canister-hub" />
      <div className="film-canister-cap" />
      <div className="film-canister-body">
        <div className="film-canister-lip" />
        <div className="film-canister-label">
          <span className="film-canister-name">Zihan</span>
          <span className="film-canister-iso">400</span>
          <span className="film-canister-exp">{photos.length} exp</span>
        </div>
      </div>
      <div className="film-canister-cap" />
    </div>
  )
}

// ── Film roll gallery ────────────────────────────────────────────
export default function PhotoGallery() {
  const canHover = useMediaQuery('(hover: hover)')
  const reduceMotion = useReducedMotion()

  const [developed, setDeveloped] = useState(() => new Set())
  const [stagger, setStagger] = useState(null) // { from } while "develop all" ripples along the strip
  const [activeRegion, setActiveRegion] = useState(REGIONS[0])
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const scrollerRef = useRef(null)
  const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 })
  const [trackRef, animate] = useAnimate()
  const stageInView = useInView(scrollerRef, { once: true, amount: 0.5 })

  const develop = useCallback((i) => {
    setDeveloped((prev) => (prev.has(i) ? prev : new Set(prev).add(i)))
  }, [])

  const cells = () => scrollerRef.current.querySelectorAll('[data-frame]')

  // Index of the frame under a given x offset (in the strip's scroll coordinates)
  const frameIndexAt = (x) => {
    const list = cells()
    const idx = Math.floor((x - list[0].offsetLeft) / list[0].offsetWidth)
    return Math.min(Math.max(idx, 0), list.length - 1)
  }

  const scrollToFrame = (i, align) => {
    const el = scrollerRef.current
    el.scrollTo({ left: cells()[i].offsetLeft - align, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  // Pull the strip out of the canister the first time it comes into view
  useEffect(() => {
    if (!stageInView || reduceMotion) return
    animate(trackRef.current, { x: [scrollerRef.current.clientWidth, 0] }, { duration: 1.4, ease: [0.16, 1, 0.3, 1] })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageInView])

  // Without a pointer that hovers, frames develop as they pass the middle of the strip
  useEffect(() => {
    if (canHover) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) develop(Number(entry.target.dataset.frame))
      })
    }, { root: scrollerRef.current, rootMargin: '0px -30% 0px -30%', threshold: 0.6 })
    cells().forEach((cell) => io.observe(cell))
    return () => io.disconnect()
  }, [canHover, develop])

  const onScroll = () => {
    const el = scrollerRef.current
    setActiveRegion(photos[frameIndexAt(el.scrollLeft + el.clientWidth / 3)].region)
  }

  const jumpTo = (region) => scrollToFrame(photos.findIndex((p) => p.region === region), 16)

  const allDeveloped = developed.size === photos.length
  const toggleAll = () => {
    setStagger({ from: frameIndexAt(scrollerRef.current.scrollLeft) })
    setDeveloped(allDeveloped ? new Set() : new Set(photos.map((_, i) => i)))
  }
  useEffect(() => {
    if (!stagger) return
    const t = setTimeout(() => setStagger(null), photos.length * 45 + 1000)
    return () => clearTimeout(t)
  }, [stagger])

  // ── Mouse drag to scroll (touch and trackpads scroll natively) ──
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    drag.current = { active: true, moved: false, startX: e.clientX, startScroll: scrollerRef.current.scrollLeft }
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d.active) return
    const dx = e.clientX - d.startX
    if (!d.moved && Math.abs(dx) > 4) {
      d.moved = true
      scrollerRef.current.setPointerCapture(e.pointerId)
      scrollerRef.current.classList.add('is-dragging')
    }
    if (d.moved) scrollerRef.current.scrollLeft = d.startScroll - dx
  }
  const endDrag = () => {
    drag.current.active = false
    scrollerRef.current.classList.remove('is-dragging')
  }
  // A drag shouldn't also count as a click on the frame it ended over
  const onClickCapture = (e) => {
    if (drag.current.moved) {
      e.stopPropagation()
      e.preventDefault()
      drag.current.moved = false
    }
  }

  // ── Lightbox ──
  const openLightbox = (i) => { develop(i); setLightboxIndex(i) }
  const closeLightbox = () => {
    // Leave the strip showing wherever the lightbox left off
    const el = scrollerRef.current
    const cell = cells()[lightboxIndex]
    const visible = cell.offsetLeft >= el.scrollLeft
      && cell.offsetLeft + cell.offsetWidth <= el.scrollLeft + el.clientWidth - cell.offsetWidth
    if (!visible) scrollToFrame(lightboxIndex, el.clientWidth / 3)
    setLightboxIndex(null)
  }
  const prevPhoto = useCallback(() => setLightboxIndex((i) => (i - 1 + photos.length) % photos.length), [])
  const nextPhoto = useCallback(() => setLightboxIndex((i) => (i + 1) % photos.length), [])
  useEffect(() => { if (lightboxIndex !== null) develop(lightboxIndex) }, [lightboxIndex, develop])

  return (
    <div className="film">
      {/* Region jumps + developed count */}
      <div className="film-controls">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => jumpTo(r)}
              className={`film-region${activeRegion === r ? ' is-active' : ''}`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="film-count">
          <span>{developed.size} of {photos.length} developed</span>
          <button onClick={toggleAll}>{allDeveloped ? 'Back to negatives' : 'Develop all'}</button>
        </div>
      </div>

      {/* Strip + canister */}
      <div className="film-stage">
        <div
          ref={scrollerRef}
          className="film-scroller"
          onScroll={onScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
        >
          <div ref={trackRef} className="film-track">
            <BlankFilm className="film-leader" label="Zihan 400" />
            {photos.map((photo, i) => {
              const delay = stagger ? Math.max(0, i - stagger.from) * 45 : 0
              return (
                <div key={photo.src} className="film-cell" data-frame={i}>
                  <div className="film-band film-band--top">
                    <span>{i + 1}</span>
                    <span>▸{i + 1}A</span>
                  </div>
                  <div className="film-gate">
                    <button
                      type="button"
                      className={`film-frame${developed.has(i) ? ' is-developed' : ''}`}
                      style={{ '--delay': `${delay}ms` }}
                      onMouseEnter={() => develop(i)}
                      onFocus={() => develop(i)}
                      onClick={() => openLightbox(i)}
                      aria-label={`Frame ${i + 1}: ${photo.location}. Open full size`}
                    >
                      <img src={thumbOf(photo.src)} alt="" loading="lazy" draggable={false} />
                    </button>
                  </div>
                  <div className="film-band film-band--bottom">
                    <span>{edgeName(photo.location)}</span>
                  </div>
                </div>
              )
            })}
            <BlankFilm className="film-tail" />
          </div>
        </div>
        <Canister />
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            photos={photos}
            index={lightboxIndex}
            onClose={closeLightbox}
            onPrev={prevPhoto}
            onNext={nextPhoto}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
