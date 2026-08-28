import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FadeInSection from './FadeInSection'
import { visitorApi } from '../data/content'
import { COLS, ROWS, decodeLandMask, project } from '../data/landmask'

// ── Helpers ──────────────────────────────────────────────────────

/** 'JP' → 🇯🇵 (regional indicator pair). */
function flagOf(cc) {
  if (!cc || cc.length !== 2) return '·'
  return String.fromCodePoint(...[...cc.toUpperCase()].map((ch) => 0x1f1a5 + ch.charCodeAt(0)))
}

/** Reads a themed CSS variable off the document root. */
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

// ── Data ─────────────────────────────────────────────────────────

/**
 * Fetches the aggregate, asking the worker to count this visit once per browser
 * session. Returns { status, data } where status is loading | ready | off | error.
 */
function useVisitorData(endpoint) {
  const [state, setState] = useState({ status: endpoint ? 'loading' : 'off', data: null })

  useEffect(() => {
    if (!endpoint) return
    let alive = true

    let record = false
    try {
      record = !sessionStorage.getItem('visit-counted')
      if (record) sessionStorage.setItem('visit-counted', '1')
    } catch {
      // Private browsing can throw on sessionStorage; just skip the tally.
    }

    fetch(`${endpoint}${record ? '?record=1' : ''}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.status))))
      .then((data) => alive && setState({ status: 'ready', data }))
      .catch(() => alive && setState({ status: 'error', data: null }))

    return () => {
      alive = false
    }
  }, [endpoint])

  return state
}

// ── The halftone plate ───────────────────────────────────────────

/**
 * Paints the land mask as a dot field, developing left to right the first time
 * it scrolls into view — the way a print comes up in a tray.
 */
function LandPlate({ className }) {
  const canvasRef = useRef(null)
  const cells = useMemo(decodeLandMask, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let progress = 0
    let raf = 0
    let start = 0

    const paint = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (!width || !height) return

      if (canvas.width !== Math.round(width * dpr)) {
        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)
      }

      const ctx = canvas.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      const stepX = width / COLS
      const stepY = height / ROWS
      const radius = Math.max(0.6, Math.min(stepX, stepY) * 0.32)
      const edge = progress * (COLS + 12)

      ctx.fillStyle = cssVar('--text-secondary') || '#78716C'
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!cells[r * COLS + c]) continue
          // Dots near the developing edge land brighter, then settle back.
          const lead = edge - c
          if (lead <= 0) continue
          ctx.globalAlpha = lead < 12 ? 0.34 + 0.66 * (1 - lead / 12) : 0.34
          ctx.beginPath()
          ctx.arc((c + 0.5) * stepX, (r + 0.5) * stepY, radius, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    }

    const tick = (now) => {
      if (!start) start = now
      const t = Math.min(1, (now - start) / 1100)
      progress = 1 - Math.pow(1 - t, 3) // ease-out cubic
      paint()
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    const reveal = () => {
      if (start) return
      raf = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && reveal(),
      { threshold: 0.15 },
    )
    observer.observe(canvas)

    // Repaint on resize and on a light/dark switch, both of which invalidate
    // the pixels we just drew.
    const onResize = () => (start ? paint() : null)
    window.addEventListener('resize', onResize)
    const themeWatcher = new MutationObserver(onResize)
    themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      themeWatcher.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [cells])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}

// ── Beacons ──────────────────────────────────────────────────────

function Beacons({ cities, onHover }) {
  const max = Math.max(1, ...cities.map((c) => c.n))

  return cities.map((city, i) => {
    const { x, y } = project(city.lat, city.lon)
    if (x < 0 || x > 1 || y < 0 || y > 1) return null

    const weight = Math.log(city.n + 1) / Math.log(max + 1)
    const size = 5 + weight * 9
    const isMajor = weight > 0.55

    return (
      <motion.button
        key={`${city.cc}-${city.region}-${city.city}`}
        type="button"
        className="visitor-beacon"
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35 + Math.min(i, 40) * 0.02, duration: 0.4, ease: [0.2, 0.8, 0.3, 1] }}
        style={{
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          width: size,
          height: size,
        }}
        onMouseEnter={() => onHover({ ...city, x, y })}
        onFocus={() => onHover({ ...city, x, y })}
        onMouseLeave={() => onHover(null)}
        onBlur={() => onHover(null)}
        aria-label={`${city.city}${city.region ? `, ${city.region}` : ''} — ${city.n} visit${city.n === 1 ? '' : 's'}`}
      >
        {isMajor && <span className="visitor-beacon-halo" />}
      </motion.button>
    )
  })
}

// ── Section ──────────────────────────────────────────────────────

export default function SiteVisitors() {
  const { status, data } = useVisitorData(visitorApi)
  const [hovered, setHovered] = useState(null)

  return (
    <section id="visitors" className="w-full px-6 sm:px-10 md:px-16 lg:px-24 py-12">
      <hr className="section-divider mb-10" />
      <FadeInSection>
        <h2 className="section-title">Site Visitors</h2>

        <div className="visitor-plate">
          <LandPlate className="visitor-plate-canvas" />

          <div className="visitor-plate-overlay">
            {status === 'ready' && <Beacons cities={data.cities} onHover={setHovered} />}
          </div>

          {/* Registration marks, as on a printed plate */}
          <span className="visitor-tick" style={{ top: 10, left: 10 }} />
          <span className="visitor-tick" style={{ top: 10, right: 10 }} />
          <span className="visitor-tick" style={{ bottom: 10, left: 10 }} />
          <span className="visitor-tick" style={{ bottom: 10, right: 10 }} />

          <AnimatePresence>
            {hovered && (
              <motion.div
                className="visitor-tooltip"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.14 }}
                style={{
                  left: `${hovered.x * 100}%`,
                  top: `${hovered.y * 100}%`,
                  transform: `translate(${hovered.x > 0.72 ? '-100%' : '0'}, ${hovered.y > 0.6 ? 'calc(-100% - 14px)' : '14px'})`,
                }}
              >
                <span style={{ marginRight: 6 }}>{flagOf(hovered.cc)}</span>
                {hovered.city}
                {hovered.region ? <span style={{ color: 'var(--text-muted)' }}>, {hovered.region}</span> : null}
                <span style={{ color: 'var(--accent)', marginLeft: 8 }}>
                  {hovered.n}
                  <span style={{ color: 'var(--text-muted)' }}>×</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </FadeInSection>
    </section>
  )
}
