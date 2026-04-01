import { useEffect, useRef, useState } from 'react'
import { useAnimate } from 'framer-motion'

export default function CameraIntro({ onComplete }) {
  const [scope, animate] = useAnimate()
  const [showSkip, setShowSkip] = useState(false)
  const done = useRef(false)

  const finish = () => {
    if (done.current) return
    done.current = true
    onComplete()
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const run = async () => {
      // ── Phase 1: Viewfinder fade in (0–400ms) ────────────────
      await animate('[data-corner]', { opacity: 1 }, { duration: 0.4 })

      // ── Phase 2: AF scan & lock (500–1100ms) ──────────────────
      // Fire AF box + labels + scan line in parallel, await the slowest
      await Promise.all([
        animate('[data-af="box"]',       { opacity: 0.8 }, { duration: 0.2 }),
        animate('[data-af="label-top"]', { opacity: 0.8 }, { duration: 0.2 }),
        animate('[data-af="label-bot"]', { opacity: 0.8 }, { duration: 0.2 }),
        (async () => {
          animate('[data-scan]', { top: '15%', opacity: 1 }, { duration: 0 })
          await animate('[data-scan]', { top: '85%' }, { duration: 0.4, ease: 'linear' })
          await animate('[data-scan]', { opacity: 0 }, { duration: 0.15 })
        })(),
      ])

      // AF blink 5× (80ms on / 80ms off)
      for (let i = 0; i < 5; i++) {
        await animate('[data-af="box"]', { opacity: 0.1 }, { duration: 0.08 })
        await animate('[data-af="box"]', { opacity: 0.9 }, { duration: 0.08 })
      }
      // lock: solid accent border
      await animate('[data-af="box"]', { borderColor: '#ffffff', opacity: 1 }, { duration: 0.05 })

      // ── Phase 3: Shutter flash (1100–1350ms) ──────────────────
      // VF elements out — all at once
      await Promise.all([
        animate('[data-corner]',         { opacity: 0 }, { duration: 0.08 }),
        animate('[data-af="box"]',       { opacity: 0 }, { duration: 0.08 }),
        animate('[data-af="label-top"]', { opacity: 0 }, { duration: 0.08 }),
        animate('[data-af="label-bot"]', { opacity: 0 }, { duration: 0.08 }),
      ])
      // white flash snap in
      await animate('[data-flash]', { opacity: 1 }, { duration: 0.06, ease: 'easeOut' })
      // flash fade out
      await animate('[data-flash]', { opacity: 0 }, { duration: 0.2, ease: 'easeIn' })

      // ── Phase 4: Fade out overlay ─────────────────────────────
      await animate(scope.current, { opacity: 0 }, { duration: 0.3, ease: 'easeIn' })
      finish()
    }

    run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={scope}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(14, 14, 12, 0.45)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        willChange: 'opacity',
      }}
    >
      {/* ── Viewfinder layer ──────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>

        {/* Corner brackets */}
        {[
          { id: 'tl', style: { top: '5vh',    left: '5vw',  borderTop: '2px solid #ffffff', borderLeft:  '2px solid #ffffff' } },
          { id: 'tr', style: { top: '5vh',    right: '5vw', borderTop: '2px solid #ffffff', borderRight: '2px solid #ffffff' } },
          { id: 'bl', style: { bottom: '5vh', left: '5vw',  borderBottom: '2px solid #ffffff', borderLeft:  '2px solid #ffffff' } },
          { id: 'br', style: { bottom: '5vh', right: '5vw', borderBottom: '2px solid #ffffff', borderRight: '2px solid #ffffff' } },
        ].map(({ id, style }) => (
          <div
            key={id}
            data-corner={id}
            style={{
              position: 'absolute',
              width: '22px',
              height: '22px',
              opacity: 0,
              willChange: 'transform, opacity',
              ...style,
            }}
          />
        ))}

        {/* Scan line */}
        <div
          data-scan
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '15%',
            height: '1px',
            opacity: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.75) 50%, transparent 100%)',
            willChange: 'transform, opacity',
          }}
        />

        {/* AF box */}
        <div
          data-af="box"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '28px',
            height: '28px',
            border: '1px solid rgba(255,255,255,0)',
            opacity: 0,
            willChange: 'opacity',
          }}
        />

        {/* AF labels */}
        <div
          data-af="label-top"
          style={{
            position: 'absolute',
            top: 'calc(50% - 36px)',
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: "'DM Mono', monospace",
            fontSize: '9px',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.95)',
            whiteSpace: 'nowrap',
            opacity: 0,
          }}
        >
          AF · MF
        </div>
        <div
          data-af="label-bot"
          style={{
            position: 'absolute',
            top: 'calc(50% + 24px)',
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: "'DM Mono', monospace",
            fontSize: '9px',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.95)',
            whiteSpace: 'nowrap',
            opacity: 0,
          }}
        >
          1/500s · f/1.8
        </div>
      </div>

      {/* ── Flash layer ───────────────────────────────── */}
      <div
        data-flash
        style={{
          position: 'absolute',
          inset: 0,
          background: '#fafaf8',
          opacity: 0,
          pointerEvents: 'none',
          willChange: 'opacity',
        }}
      />

      {/* ── Skip button ───────────────────────────────── */}
      {showSkip && (
        <button
          onClick={finish}
          style={{
            position: 'absolute',
            bottom: '5vh',
            right: '5vw',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'DM Mono', monospace",
            fontSize: '10px',
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.1em',
            padding: 0,
          }}
        >
          skip
        </button>
      )}
    </div>
  )
}
