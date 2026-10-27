import { useEffect, useRef, useState } from 'react'
import { startFlute } from './sound'

// D major, from the head joint towards the foot
const HOLES = [74, 76, 78, 79, 81, 83, 85]
const HOLE_X = (i) => 150 + i * 27
const RUN = [74, 76, 78, 79, 81, 83, 85, 86]

export default function Flute({ emit, ping }) {
  const voice = useRef(null)
  const [held, setHeld] = useState(null)

  const stop = () => {
    voice.current?.stop()
    voice.current = null
    setHeld(null)
  }

  const play = (i) => {
    if (voice.current) voice.current.setNote(HOLES[i])
    else voice.current = startFlute(HOLES[i])
    setHeld(i)
    emit('♪')
  }

  // Lifting the finger anywhere ends the note
  useEffect(() => {
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    return () => {
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
      voice.current?.stop()
    }
  }, [])

  // Clicking the body (or Enter) plays a scale up the flute
  useEffect(() => {
    if (!ping) return
    const v = startFlute(RUN[0])
    setHeld(0)
    emit('♪')
    const timers = RUN.slice(1).map((midi, i) => setTimeout(() => {
      v.setNote(midi)
      setHeld(Math.min(i + 1, HOLES.length - 1))
    }, (i + 1) * 130))
    timers.push(setTimeout(() => { v.stop(); setHeld(null) }, RUN.length * 130 + 120))
    return () => { timers.forEach(clearTimeout); v.stop() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ping])

  return (
    <svg className={`diecut flute${held !== null ? ' is-playing' : ''}`} viewBox="0 0 400 60" role="img" aria-label="Flute">
      <defs>
        <linearGradient id="flute-silver" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7F9FA" />
          <stop offset="0.45" stopColor="#C9CED3" />
          <stop offset="1" stopColor="#848C94" />
        </linearGradient>
      </defs>

      {/* Breath over the lip plate */}
      <g className="flute-air" stroke="#9FB7C4" strokeWidth="2.4" fill="none" strokeLinecap="round">
        <path d="M40 12 Q46 6 52 12" />
        <path d="M30 8 Q38 1 46 7" />
      </g>

      <rect x="4" y="21" width="14" height="18" rx="3" fill="url(#flute-silver)" />
      <rect x="16" y="23" width="378" height="14" rx="5" fill="url(#flute-silver)" />
      <ellipse cx="52" cy="30" rx="15" ry="9" fill="url(#flute-silver)" stroke="#8C949B" strokeWidth="1" />
      <ellipse cx="52" cy="30" rx="5.5" ry="3.2" fill="#3B4045" />
      <rect x="100" y="21" width="6" height="18" rx="1.5" fill="#B6BCC2" />
      <rect x="330" y="21" width="6" height="18" rx="1.5" fill="#B6BCC2" />
      <line x1="130" y1="26" x2="372" y2="26" stroke="#7C848B" strokeWidth="1.6" />
      <circle cx="352" cy="30" r="6" fill="url(#flute-silver)" stroke="#8C949B" />
      <circle cx="370" cy="31" r="5" fill="url(#flute-silver)" stroke="#8C949B" />

      {HOLES.map((midi, i) => (
        <g
          key={midi}
          data-nodrag
          className={`flute-hole${held === i ? ' is-held' : ''}`}
          onPointerDown={(e) => {
            e.currentTarget.releasePointerCapture?.(e.pointerId)
            play(i)
          }}
          onPointerEnter={(e) => { if (e.buttons === 1 && voice.current) play(i) }}
        >
          <circle cx={HOLE_X(i)} cy="30" r="13" fill="transparent" />
          <circle cx={HOLE_X(i)} cy="30" r="9.5" fill="url(#flute-silver)" stroke="#8C949B" strokeWidth="1.2" />
          <circle cx={HOLE_X(i)} cy="30" r="4" className="flute-pad" />
        </g>
      ))}
    </svg>
  )
}
