import { useEffect, useState } from 'react'
import { playPiano } from './sound'

// C4 to E5, laid out like the home row of a computer keyboard
const WHITE = [
  { midi: 60, key: 'a' }, { midi: 62, key: 's' }, { midi: 64, key: 'd' }, { midi: 65, key: 'f' },
  { midi: 67, key: 'g' }, { midi: 69, key: 'h' }, { midi: 71, key: 'j' }, { midi: 72, key: 'k' },
  { midi: 74, key: 'l' }, { midi: 76, key: ';' },
]
// Each black key sits after the white key at `after`
const BLACK = [
  { midi: 61, key: 'w', after: 0 }, { midi: 63, key: 'e', after: 1 }, { midi: 66, key: 't', after: 3 },
  { midi: 68, key: 'y', after: 4 }, { midi: 70, key: 'u', after: 5 }, { midi: 73, key: 'o', after: 7 },
  { midi: 75, key: 'p', after: 8 },
]
const BY_KEY = Object.fromEntries([...WHITE, ...BLACK].map((k) => [k.key, k.midi]))

const KEY_W = 28
const LEFT = 10
const TOP = 18

export default function Piano({ emit, listening, ping }) {
  const [down, setDown] = useState(() => new Set())

  const press = (midi) => {
    playPiano(midi)
    emit(midi % 2 ? '♪' : '♫')
    setDown((s) => new Set(s).add(midi))
  }
  const release = (midi) => setDown((s) => {
    if (!s.has(midi)) return s
    const next = new Set(s)
    next.delete(midi)
    return next
  })

  // Clicking the case (or Enter) rolls a C major chord
  useEffect(() => {
    if (!ping) return
    const timers = [60, 64, 67, 72].flatMap((midi, i) => [
      setTimeout(() => press(midi), i * 90),
      setTimeout(() => release(midi), i * 90 + 260),
    ])
    return () => timers.forEach(clearTimeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ping])

  // The computer keyboard plays along while nothing else has focus
  useEffect(() => {
    if (!listening) return
    const typing = (el) => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))
    const onDown = (e) => {
      const midi = BY_KEY[e.key.toLowerCase()]
      if (midi === undefined || e.repeat || e.metaKey || e.ctrlKey || e.altKey || typing(document.activeElement)) return
      press(midi)
    }
    const onUp = (e) => {
      const midi = BY_KEY[e.key.toLowerCase()]
      if (midi !== undefined) release(midi)
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening])

  const keyProps = (midi) => ({
    'data-nodrag': true,
    className: `piano-key${down.has(midi) ? ' is-down' : ''}`,
    onPointerDown: (e) => {
      e.currentTarget.releasePointerCapture?.(e.pointerId)
      press(midi)
    },
    // Sliding across the keys with the button held plays each one
    onPointerEnter: (e) => { if (e.buttons === 1) press(midi) },
    onPointerUp: () => release(midi),
    onPointerLeave: () => release(midi),
  })

  return (
    <svg className="diecut piano" viewBox="0 0 300 100" role="img" aria-label="Piano keyboard">
      <rect x="0" y="0" width="300" height="100" rx="10" fill="#211D1A" />
      <rect x="0" y="0" width="300" height="100" rx="10" fill="url(#piano-sheen)" />
      <rect x={LEFT} y={TOP - 4} width={KEY_W * WHITE.length} height="4" fill="#8E2B2B" />

      {WHITE.map((k, i) => (
        <g key={k.midi} {...keyProps(k.midi)}>
          <rect x={LEFT + i * KEY_W + 0.6} y={TOP} width={KEY_W - 1.2} height="72" rx="3" className="piano-white" />
          <text x={LEFT + i * KEY_W + KEY_W / 2} y={TOP + 64} textAnchor="middle" className="piano-hint">{k.key}</text>
        </g>
      ))}
      {BLACK.map((k) => (
        <g key={k.midi} {...keyProps(k.midi)}>
          <rect x={LEFT + (k.after + 1) * KEY_W - 8.5} y={TOP} width="17" height="44" rx="2" className="piano-black" />
        </g>
      ))}

      <defs>
        <linearGradient id="piano-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
