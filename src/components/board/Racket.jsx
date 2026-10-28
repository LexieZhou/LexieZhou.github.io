import { useEffect, useId, useState } from 'react'
import { playHit } from './sound'

// String bed: evenly spaced lines clipped to the head
function Strings({ clipId, x0, x1, y0, y1, gap, color, width }) {
  const lines = []
  for (let x = x0; x <= x1; x += gap) lines.push(<line key={`v${x}`} x1={x} y1={y0} x2={x} y2={y1} />)
  for (let y = y0; y <= y1; y += gap) lines.push(<line key={`h${y}`} x1={x0} y1={y} x2={x1} y2={y} />)
  return <g clipPath={`url(#${clipId})`} stroke={color} strokeWidth={width}>{lines}</g>
}

// Wrapped grip: base colour, diagonal overlap lines and a soft highlight
function Grip({ x, y, w, h, fill, line }) {
  const wraps = []
  for (let yy = y + 4; yy < y + h; yy += 6) wraps.push(<line key={yy} x1={x} y1={yy + 3} x2={x + w} y2={yy - 3} />)
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="2.5" fill={fill} />
      <g stroke={line} strokeWidth="1.2">{wraps}</g>
      <rect x={x + w * 0.22} y={y + 2} width={w * 0.18} height={h - 4} rx="1" fill="#fff" opacity="0.14" />
    </g>
  )
}

// A tennis racket: thin pastel pink frame, white strings, white grip
function Tennis({ onHit, uid, box }) {
  const clip = `${uid}-t-clip`
  return (
    <svg viewBox="0 0 120 300" overflow="visible" {...box}>
      <defs><clipPath id={clip}><ellipse cx="60" cy="82" rx="42" ry="60" /></clipPath></defs>

      <path d="M37 136 Q48 168 55 198 M83 136 Q72 168 65 198" fill="none" stroke="#F2C3D1" strokeWidth="6.5" strokeLinecap="round" />
      <path d="M38 138 Q48 168 55 196" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

      <g data-nodrag className="racket-face" onPointerDown={onHit}>
        <ellipse cx="60" cy="82" rx="42" ry="60" fill="#FFFFFF" />
        <Strings clipId={clip} x0={20} x1={100} y0={22} y1={142} gap={5.2} color="#D9D9DF" width="0.9" />
      </g>

      <g fill="none" pointerEvents="none">
        <ellipse cx="60" cy="82" rx="45.5" ry="63.5" stroke="#F2C3D1" strokeWidth="6.5" />
        <ellipse cx="60" cy="82" rx="48.6" ry="66.6" stroke="#E3A6BA" strokeWidth="0.8" />
        <path d="M18 70 A45.5 63.5 0 0 1 48 20" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      </g>

      <rect x="53" y="194" width="14" height="12" rx="1" fill="#F2C3D1" />
      <Grip x={51} y={205} w={18} h={78} fill="#F6F6F4" line="#DADAD5" />
      <rect x="50" y="282" width="20" height="10" rx="3" fill="#F2C3D1" />
    </svg>
  )
}

const PADDLE = 'M22 32 Q22 10 46 10 H94 Q118 10 118 32 V140 Q118 166 94 176 Q80 182 77 194 H63 Q60 182 46 176 Q22 166 22 140 Z'
const inset = (k) => `translate(70 100) scale(${k}) translate(-70 -100)`

// A paddle with a bright blue face, a white edge guard, a red collar and a white grip
function Pickleball({ onHit, uid, box }) {
  const face = `${uid}-p-face`
  return (
    <svg viewBox="0 0 140 262" overflow="visible" {...box}>
      <defs>
        <linearGradient id={face} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#47A3F0" />
          <stop offset="1" stopColor="#2A84D8" />
        </linearGradient>
      </defs>

      <g data-nodrag className="racket-face" onPointerDown={onHit}>
        <path d={PADDLE} fill="#FBFBFA" stroke="#C9CED4" strokeWidth="1.2" />
        <path d={PADDLE} fill={`url(#${face})`} transform={inset(0.92)} />
        <path d="M34 22 Q70 14 108 26" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.18" pointerEvents="none" />
        <text
          transform="translate(37 28) rotate(90)"
          fill="#fff"
          fontFamily="'DM Sans', sans-serif"
          fontWeight="500"
          fontSize="17"
          stroke="#fff"
          strokeWidth="0.7"
          letterSpacing="1"
          pointerEvents="none"
        >
          PICKLEBALL
        </text>
      </g>

      <rect x="62" y="189" width="16" height="9" rx="1.5" fill="#E5484D" />
      <Grip x={60} y={197} w={20} h={52} fill="#F4F4F2" line="#D6D6D1" />
      <rect x="58" y="248" width="24" height="9" rx="4" fill="#FBFBFA" stroke="#C9CED4" strokeWidth="1" />
    </svg>
  )
}

// Both handles meet at one point and the heads fan out from it
const PIVOT = { x: 150, y: 330 }
const PAIR = [
  { kind: 'tennis', Art: Tennis, tilt: -26, box: { x: 90, y: 38, width: 120, height: 300 } },
  { kind: 'pickleball', Art: Pickleball, tilt: 26, box: { x: 80, y: 73, width: 140, height: 262 } },
]

/**
 * A tennis racket and a pickleball paddle held together at the handles.
 * Hitting either face swings that one and hands its ball to the board;
 * clicking the handles (or Enter) swings both.
 */
export default function RacketPair({ dir, onHit, ping }) {
  const uid = useId().replace(/:/g, '')
  const [swings, setSwings] = useState({ tennis: 0, pickleball: 0 })

  const hit = (kind) => {
    playHit(kind)
    setSwings((s) => ({ ...s, [kind]: s[kind] + 1 }))
    onHit(kind)
  }

  useEffect(() => {
    if (!ping) return
    hit('tennis')
    const t = setTimeout(() => hit('pickleball'), 200)
    return () => clearTimeout(t)
  }, [ping]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <svg className="diecut rackets" viewBox="-6 46 312 294" style={{ '--dir': dir }} role="img" aria-label="Tennis racket and pickleball paddle">
      {PAIR.map(({ kind, Art, tilt, box }) => (
        <g key={kind} transform={`rotate(${tilt} ${PIVOT.x} ${PIVOT.y})`}>
          {/* Remounting on each hit replays the swing */}
          <g key={swings[kind]} className={`racket-swing${swings[kind] ? ' is-swinging' : ''}`}>
            <Art onHit={() => hit(kind)} uid={uid} box={box} />
          </g>
        </g>
      ))}
    </svg>
  )
}

// The ball each racket sends across the board
export function Ball({ kind }) {
  if (kind === 'tennis') {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="9" fill="#D4E157" />
        <path d="M3 5 Q9 10 3 15 M17 5 Q11 10 17 15" fill="none" stroke="#FBFAF6" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="#F3D23B" />
      {[[10, 4.5], [5, 8], [15, 8], [7, 14], [13, 14], [10, 10]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.5" fill="#B8961A" />
      ))}
    </svg>
  )
}
