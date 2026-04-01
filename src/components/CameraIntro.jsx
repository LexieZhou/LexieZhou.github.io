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
      // ── Phase 1: Viewfinder expand (0–500ms) ──────────────────
      await animate([
        // corners fade in
        ['[data-corner]', { opacity: 1 }, { duration: 0.1, at: 0 }],
        // tl
        ['[data-corner="tl"]', { top: '5vh', left: '5vw' },   { duration: 0.5, ease: [0.25, 0, 0, 1], at: 0 }],
        // tr
        ['[data-corner="tr"]', { top: '5vh', right: '5vw' },  { duration: 0.5, ease: [0.25, 0, 0, 1], at: 0 }],
        // bl
        ['[data-corner="bl"]', { bottom: '5vh', left: '5vw' }, { duration: 0.5, ease: [0.25, 0, 0, 1], at: 0 }],
        // br
        ['[data-corner="br"]', { bottom: '5vh', right: '5vw' }, { duration: 0.5, ease: [0.25, 0, 0, 1], at: 0 }],
      ])

      // ── Phase 2: AF scan & lock (500–1100ms) ──────────────────
      await animate([
        // AF box + labels appear
        ['[data-af="box"]',        { opacity: 0.8 }, { duration: 0.2, at: 0 }],
        ['[data-af="label-top"]',  { opacity: 0.8 }, { duration: 0.2, at: 0 }],
        ['[data-af="label-bot"]',  { opacity: 0.8 }, { duration: 0.2, at: 0 }],
        // scan line sweeps top → bottom
        ['[data-scan]', { top: '15%', opacity: 1 }, { duration: 0, at: 0 }],
        ['[data-scan]', { top: '85%' },             { duration: 0.4, ease: 'linear', at: 0 }],
        ['[data-scan]', { opacity: 0 },             { duration: 0.15, at: 0.3 }],
      ])

      // AF blink 5× (80ms on / 80ms off)
      for (let i = 0; i < 5; i++) {
        await animate('[data-af="box"]', { opacity: 0.1 }, { duration: 0.08 })
        await animate('[data-af="box"]', { opacity: 0.9 }, { duration: 0.08 })
      }
      // lock: solid accent border
      await animate('[data-af="box"]', { borderColor: '#c4ad8a', opacity: 1 }, { duration: 0.05 })

      // ── Phase 3: Shutter flash (1100–1350ms) ──────────────────
      // VF elements out
      await animate([
        ['[data-corner]',       { opacity: 0 }, { duration: 0.08, at: 0 }],
        ['[data-af="box"]',     { opacity: 0 }, { duration: 0.08, at: 0 }],
        ['[data-af="label-top"]', { opacity: 0 }, { duration: 0.08, at: 0 }],
        ['[data-af="label-bot"]', { opacity: 0 }, { duration: 0.08, at: 0 }],
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
        background: '#0e0e0c',
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
          { id: 'tl', style: { top: '50%', left: '50%',  borderTop: '1.5px solid #c4ad8a', borderLeft:  '1.5px solid #c4ad8a' } },
          { id: 'tr', style: { top: '50%', right: '50%', borderTop: '1.5px solid #c4ad8a', borderRight: '1.5px solid #c4ad8a' } },
          { id: 'bl', style: { bottom: '50%', left: '50%',  borderBottom: '1.5px solid #c4ad8a', borderLeft:  '1.5px solid #c4ad8a' } },
          { id: 'br', style: { bottom: '50%', right: '50%', borderBottom: '1.5px solid #c4ad8a', borderRight: '1.5px solid #c4ad8a' } },
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
            background: 'linear-gradient(90deg, transparent 0%, rgba(196,173,138,0.5) 50%, transparent 100%)',
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
            border: '1px solid rgba(196,173,138,0)',
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
            color: 'rgba(196,173,138,0.8)',
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
            color: 'rgba(196,173,138,0.8)',
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
            color: 'rgba(196,173,138,0.4)',
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
