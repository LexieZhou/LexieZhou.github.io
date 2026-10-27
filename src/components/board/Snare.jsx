import { useEffect, useRef, useState } from 'react'
import { motion, useAnimate, useReducedMotion } from 'framer-motion'
import { playSnare } from './sound'

const HEAD = { cx: 100, cy: 80, rx: 74, ry: 22 }
const LUGS = [30, 60, 100, 140, 170]

let rippleId = 0

export default function Snare({ emit, ping }) {
  const reduceMotion = useReducedMotion()
  const svgRef = useRef(null)
  const [scope, animate] = useAnimate()
  const [ripples, setRipples] = useState([])
  const [hits, setHits] = useState(0)

  const strike = (rim, point = { x: HEAD.cx, y: HEAD.cy }) => {
    playSnare({ rim })
    emit(rim ? '✕' : '♩')
    if (reduceMotion) return
    if (!rim) setRipples((r) => [...r.slice(-4), { id: rippleId++, ...point }])
    animate(scope.current, { scaleY: [1, rim ? 0.98 : 0.93, 1] }, { duration: 0.18 })
    setHits((n) => n + 1)
  }

  // Where on the drawing the pointer landed
  const toSvg = (e) => {
    const pt = svgRef.current.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    return pt.matrixTransform(svgRef.current.getScreenCTM().inverse())
  }

  useEffect(() => { if (ping) strike(false) }, [ping]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div ref={scope} style={{ originY: 1 }}>
      <svg ref={svgRef} className="diecut snare" viewBox="0 0 200 196" role="img" aria-label="Snare drum">
        <defs>
          <linearGradient id="snare-shell" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#6E1F1C" />
            <stop offset="0.3" stopColor="#B83A33" />
            <stop offset="0.45" stopColor="#D9645A" />
            <stop offset="0.7" stopColor="#A8322D" />
            <stop offset="1" stopColor="#5C1917" />
          </linearGradient>
          <linearGradient id="snare-chrome" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7E858C" />
            <stop offset="0.35" stopColor="#F2F4F6" />
            <stop offset="0.6" stopColor="#AEB4BA" />
            <stop offset="1" stopColor="#6C737A" />
          </linearGradient>
        </defs>

        {/* Shell, bottom hoop and lugs */}
        <path d="M20 80 V146 A80 26 0 0 0 180 146 V80 Z" fill="url(#snare-shell)" />
        <path d="M20 146 A80 26 0 0 0 180 146" fill="none" stroke="url(#snare-chrome)" strokeWidth="8" />
        {LUGS.map((x) => (
          <rect key={x} x={x - 4} y={104 + (x === 100 ? 6 : 2)} width="8" height="26" rx="3" fill="url(#snare-chrome)" />
        ))}
        <rect x="94" y="150" width="12" height="16" rx="2" fill="#2B2A28" opacity="0.6" />

        {/* Head: hit it */}
        <g data-nodrag className="snare-head" onPointerDown={(e) => strike(false, toSvg(e))}>
          <ellipse {...HEAD} fill="#F2EDE2" />
          <ellipse cx={HEAD.cx} cy={HEAD.cy + 3} rx={HEAD.rx - 10} ry={HEAD.ry - 6} fill="#E6DFD0" />
          {ripples.map((r) => (
            <ellipse
              key={r.id}
              className="snare-ripple"
              cx={r.x} cy={r.y} rx="40" ry="12"
              onAnimationEnd={() => setRipples((list) => list.filter((x) => x.id !== r.id))}
            />
          ))}
        </g>

        {/* Top hoop: a rimshot */}
        <ellipse
          data-nodrag className="snare-rim"
          cx={HEAD.cx} cy={HEAD.cy} rx="80" ry="26"
          fill="none" stroke="url(#snare-chrome)" strokeWidth="8"
          onPointerDown={() => strike(true)}
        />

        {/* Sticks */}
        <g className="snare-sticks" strokeLinecap="round">
          {/* Remounting on each hit replays the swing */}
          <g key={hits} className={`snare-stick-a${hits ? ' is-swinging' : ''}`}>
            <line x1="186" y1="6" x2="104" y2="66" stroke="#D9B98A" strokeWidth="6" />
            <circle cx="104" cy="66" r="4.5" fill="#E8CFA4" />
          </g>
          <line x1="14" y1="14" x2="88" y2="64" stroke="#C9A676" strokeWidth="6" />
          <circle cx="88" cy="64" r="4.5" fill="#E2C69A" />
        </g>
      </svg>
    </motion.div>
  )
}
