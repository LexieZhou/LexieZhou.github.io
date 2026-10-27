import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, animate, useMotionValue, useReducedMotion } from 'framer-motion'
import { usePets } from '../hooks/usePets'

/**
 * The nap cat from the favicon, keeping the reader company.
 *
 * It naps on the divider of whichever section is being read, and hops to the
 * next one as that section's divider rises past the middle of the screen. On
 * wider screens the perch is sticky, so the cat rides along in the right-hand
 * gutter while a long section scrolls by.
 *
 * By day it sleeps: a cursor nearby makes it open one eye, a click (or tap)
 * gets a purr and a heart, and left alone it dozes off again. In dark mode it
 * is a night owl — eyes open and glowing, following the cursor.
 */

const INK = '#2E2A3B'
const FUR = '#FFCFAE'
const NEAR = 150 // px from the cat's centre that counts as "nearby"

/** Drop one of these just before a section's divider to give the cat a place to nap. */
export function CatPerch({ className }) {
  return <div className={className ? `cat-perch ${className}` : 'cat-perch'} aria-hidden="true" />
}

// ── Drawing ──────────────────────────────────────────────────────

const EYE_X = { left: 205, right: 295 }
const EYE_Y = 271

function Eye({ side, state, dark, pupilX, pupilY, glowId }) {
  const cx = EYE_X[side]

  if (state === 'closed') {
    return <path d={`M${cx - 15} 268 Q${cx} 282 ${cx + 15} 268`} fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
  }
  if (state === 'happy') {
    return <path d={`M${cx - 15} 276 Q${cx} 258 ${cx + 15} 276`} fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
  }
  if (dark) {
    return (
      <g>
        <circle cx={cx} cy={EYE_Y} r="13" fill="#FFC94D" filter={`url(#${glowId})`} />
        <motion.ellipse cx={cx} cy={EYE_Y} rx="3.4" ry="9.5" fill={INK} style={{ x: pupilX, y: pupilY }} />
      </g>
    )
  }
  return (
    <motion.g style={{ x: pupilX, y: pupilY }}>
      <circle cx={cx} cy={EYE_Y} r="11" fill={INK} />
      <circle cx={cx - 3.5} cy={EYE_Y - 4} r="3.5" fill="#fff" />
    </motion.g>
  )
}

function CatArt({ eyes, side, dark, pupilX, pupilY }) {
  const glowId = useId().replace(/:/g, '')
  const eyeState = (s) => {
    if (eyes === 'peek') return s === side ? 'open' : 'closed'
    return eyes
  }

  return (
    <svg viewBox="32 88 402 294" data-eyes={eyes} data-side={side} aria-hidden="true">
      <defs>
        <filter id={glowId} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Tail, curled into a Z */}
      <path d="M58 196 H112 L60 282 H140" fill="none" stroke={INK} strokeWidth="46" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M58 196 H112 L60 282 H140" fill="none" stroke={FUR} strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="58" cy="196" r="13" fill="#F2A57E" />

      <g className="nap-cat-ear nap-cat-ear-left">
        <path d="M165 224 L178 158 L228 198 Z" fill={FUR} stroke={INK} strokeWidth="8" strokeLinejoin="round" />
        <path d="M183 206 L188 178 L208 195 Z" fill="#FF9AAE" stroke="#FF9AAE" strokeWidth="4" strokeLinejoin="round" />
      </g>
      <g className="nap-cat-ear nap-cat-ear-right">
        <path d="M335 224 L322 158 L272 198 Z" fill={FUR} stroke={INK} strokeWidth="8" strokeLinejoin="round" />
        <path d="M317 206 L312 178 L292 195 Z" fill="#FF9AAE" stroke="#FF9AAE" strokeWidth="4" strokeLinejoin="round" />
      </g>

      <path
        d="M120 330 C120 230 170 185 250 185 C330 185 380 230 380 330 C380 352 365 362 345 362 H155 C135 362 120 352 120 330 Z"
        fill={FUR}
        stroke={INK}
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <path d="M240 200 V214 M250 196 V214 M260 200 V214" fill="none" stroke="#F2A57E" strokeWidth="7" strokeLinecap="round" />

      <Eye side="left" state={eyeState('left')} dark={dark} pupilX={pupilX} pupilY={pupilY} glowId={glowId} />
      <Eye side="right" state={eyeState('right')} dark={dark} pupilX={pupilX} pupilY={pupilY} glowId={glowId} />

      <ellipse cx="184" cy="294" rx="14" ry="8" fill="#FF9AAE" fillOpacity="0.8" />
      <ellipse cx="316" cy="294" rx="14" ry="8" fill="#FF9AAE" fillOpacity="0.8" />
      <path d="M243 283 H257 L250 291 Z" fill="#FF8FA3" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M239 297 Q244 303 250 296 Q256 303 261 297" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />

      <ellipse cx="210" cy="360" rx="25" ry="15" fill={FUR} stroke={INK} strokeWidth="7" />
      <ellipse cx="290" cy="360" rx="25" ry="15" fill={FUR} stroke={INK} strokeWidth="7" />

      <g className="nap-cat-zzz">
        <path className="nap-cat-z" d="M378 136 H400 L378 160 H400" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <path className="nap-cat-z nap-cat-z-late" d="M412 96 H427 L412 113 H427" fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  )
}

function Heart() {
  return (
    <svg viewBox="0 0 24 22" aria-hidden="true">
      <path d="M12 21 C5 15.5 1 12 1 7 A5.5 5.5 0 0 1 12 4.2 A5.5 5.5 0 0 1 23 7 C23 12 19 15.5 12 21 Z" fill="currentColor" />
    </svg>
  )
}

const plural = (n, word) => `${n.toLocaleString()} ${word}${n === 1 ? '' : 's'}`

// ── The cat ──────────────────────────────────────────────────────

export default function NapCat({ isDark }) {
  const reduced = useReducedMotion()
  const [tally, pet] = usePets()

  const [perches, setPerches] = useState([])
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  const catRef = useRef(null)
  const fromRect = useRef(null)
  const hops = useRef([])

  const [near, setNear] = useState(false)
  const [side, setSide] = useState('right')
  const [awake, setAwake] = useState(false)
  const [purring, setPurring] = useState(false)
  const [hearts, setHearts] = useState([])
  const [showTally, setShowTally] = useState(false)
  const timers = useRef({})

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const squashX = useMotionValue(1)
  const squashY = useMotionValue(1)
  const shake = useMotionValue(0)
  const pupilX = useMotionValue(0)
  const pupilY = useMotionValue(0)

  /** Restarts one named timer. */
  const later = (name, ms, fn) => {
    clearTimeout(timers.current[name])
    timers.current[name] = setTimeout(fn, ms)
  }
  const dozeOff = (ms) => later('sleep', ms, () => setAwake(false))

  useEffect(() => {
    const all = timers.current
    return () => Object.values(all).forEach(clearTimeout)
  }, [])

  // Find the perches once the sections are on the page.
  useEffect(() => {
    setPerches([...document.querySelectorAll('.cat-perch')])
  }, [])

  // The active perch belongs to the last section whose divider has risen past
  // 60% of the viewport — or the last section once the page bottoms out.
  useEffect(() => {
    if (!perches.length) return
    let raf = 0

    const update = () => {
      raf = 0
      const line = window.innerHeight * 0.6
      let idx = 0
      perches.forEach((perch, i) => {
        const divider = perch.nextElementSibling
        if (divider && divider.getBoundingClientRect().top <= line) idx = i
      })
      const root = document.documentElement
      if (window.innerHeight + window.scrollY >= root.scrollHeight - 2) idx = perches.length - 1

      if (idx !== activeRef.current) {
        fromRect.current = catRef.current?.getBoundingClientRect() ?? null
        activeRef.current = idx
        setActive(idx)
      }
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [perches])

  // Hop to the new perch: measure where the cat was and where it now sits,
  // start it at the old spot and arc it down (or up) into place.
  useLayoutEffect(() => {
    const from = fromRect.current
    const el = catRef.current
    fromRect.current = null
    if (!from || !el) return

    hops.current.forEach((h) => h.stop())
    const rect = el.getBoundingClientRect()
    // The new element mounted with whatever offset a cut-short hop left behind.
    const toLeft = rect.left - x.get()
    const toTop = rect.top - y.get()
    x.set(0)
    y.set(0)
    if (reduced) return

    // A cat that was off screen enters from the edge it left by, not from afar.
    const vh = window.innerHeight
    let fromTop = from.top
    if (from.bottom < 0) fromTop = -from.height - 8
    else if (from.top > vh) fromTop = vh + 8

    const dx = from.left - toLeft
    const dy = fromTop - toTop
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return

    setAwake(true)
    x.set(dx)
    y.set(dy)
    const duration = 0.65
    const fly = animate(y, [dy, Math.min(dy, 0) - 36, 0], { duration, times: [0, 0.4, 1], ease: ['easeOut', 'easeIn'] })
    hops.current = [animate(x, 0, { duration, ease: [0.3, 0, 0.3, 1] }), fly]

    fly.then(() => {
      hops.current = [
        animate(squashY, [1, 0.8, 1.05, 1], { duration: 0.35 }),
        animate(squashX, [1, 1.12, 0.97, 1], { duration: 0.35 }),
      ]
      dozeOff(1800)
    })
  }, [active])

  // Watch the cursor: nearby wakes one eye, and the pupils follow it.
  useEffect(() => {
    let raf = 0
    let last = null

    const update = () => {
      raf = 0
      const el = catRef.current
      if (!el || !last) return
      const r = el.getBoundingClientRect()
      const dx = last.clientX - (r.left + r.width / 2)
      const dy = last.clientY - (r.top + r.height / 2)
      const dist = Math.hypot(dx, dy) || 1
      const isNear = dist < NEAR

      pupilX.set((dx / dist) * Math.min(4, dist / 20))
      pupilY.set((dy / dist) * Math.min(3, dist / 20))
      setNear(isNear)
      setSide(dx < 0 ? 'left' : 'right')
      if (isNear) later('sleep', 5000, () => setAwake(false))
    }

    const onMove = (e) => {
      if (e.pointerType === 'touch') return
      last = e
      if (!raf) raf = requestAnimationFrame(update)
    }
    const onLeave = () => setNear(false)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  const onPet = () => {
    pet()
    setAwake(true)
    setPurring(true)
    later('purr', 650, () => setPurring(false))
    dozeOff(6000)

    const id = Date.now() + Math.random()
    setHearts((hs) => [...hs, { id, drift: Math.random() * 24 - 12 }])
    setTimeout(() => setHearts((hs) => hs.filter((h) => h.id !== id)), 1100)

    setShowTally(true)
    later('tally', 2800, () => setShowTally(false))

    if (!reduced) animate(shake, [0, -2, 2, -1.5, 1.5, -0.5, 0], { duration: 0.45 })
  }

  const eyes = purring ? 'happy' : isDark || awake ? 'open' : near ? 'peek' : 'closed'
  const perch = perches[active]
  if (!perch) return null

  return createPortal(
    <motion.div ref={catRef} className="nap-cat" style={{ x, y }}>
      <button type="button" className="nap-cat-button" onClick={onPet} aria-label="Pet the cat">
        <motion.div style={{ x: shake, scaleX: squashX, scaleY: squashY, originY: 1 }}>
          <CatArt eyes={eyes} side={side} dark={isDark} pupilX={pupilX} pupilY={pupilY} />
        </motion.div>
      </button>

      {hearts.map((h) => (
        <motion.span
          key={h.id}
          className="nap-cat-heart"
          initial={{ opacity: 0, y: 0, x: 0, scale: 0.6 }}
          animate={reduced ? { opacity: [0, 1, 0] } : { opacity: [0, 1, 0], y: -34, x: h.drift, scale: 1 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        >
          <Heart />
        </motion.span>
      ))}

      <AnimatePresence>
        {showTally && tally && (
          <motion.p
            className="nap-cat-tally"
            role="status"
            style={{ y: '-50%' }}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.18 }}
          >
            Petted {plural(tally.total, 'time')} by {plural(tally.petters, 'visitor')}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>,
    perch,
  )
}
