import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, useInView } from 'framer-motion'
import { layouts, places, tapeLabels } from '../../data/board'
import { photos } from '../../data/photos'
import Sticker from './Sticker'
import Piano from './Piano'
import Flute from './Flute'
import Snare from './Snare'
import Stamp from './Stamp'
import RicSticker from './RicSticker'
import RacketPair, { Ball } from './Racket'
import PrintStack from './PrintStack'
import { CatPerch } from '../NapCat'

const STORAGE_KEY = 'funBoard'

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])
  return matches
}

// Where visitors left the stickers, per layout. Only a convenience, so any failure means "use the defaults".
function loadMoved(layoutKey) {
  try {
    const saved = JSON.parse(localStorage.getItem(`${STORAGE_KEY}:${layoutKey}`))
    return saved && typeof saved === 'object' ? saved : {}
  } catch {
    return {}
  }
}

function saveMoved(layoutKey, moved) {
  try {
    localStorage.setItem(`${STORAGE_KEY}:${layoutKey}`, JSON.stringify(moved))
  } catch {
    // Storage blocked: the board still works, it just won't remember
  }
}

let burstId = 0
let ballId = 0

export default function Board() {
  const mobile = useMediaQuery('(max-width: 640px)')
  const layoutKey = mobile ? 'mobile' : 'desktop'
  const layout = layouts[layoutKey]

  const matRef = useRef(null)
  const shown = useInView(matRef, { once: true, amount: 0.25 })

  const [moved, setMoved] = useState(() => loadMoved(layoutKey))
  const [order, setOrder] = useState(() => Object.keys(layout.stickers))
  const [pings, setPings] = useState({})
  const [ricFlipped, setRicFlipped] = useState(false)
  const [openPlace, setOpenPlace] = useState(null)
  const [bursts, setBursts] = useState([])
  const [balls, setBalls] = useState([])

  useEffect(() => { setMoved(loadMoved(layoutKey)) }, [layoutKey])

  const posOf = useCallback((id) => {
    const base = layout.stickers[id]
    const m = moved[id]
    return m && Number.isFinite(m.x) && Number.isFinite(m.y) ? { ...base, x: m.x, y: m.y } : base
  }, [layout, moved])

  // Instruments keep their emit from an earlier render, so read positions fresh
  const posRef = useRef(posOf)
  posRef.current = posOf

  const raise = useCallback((id) => {
    setOrder((o) => (o[o.length - 1] === id ? o : [...o.filter((x) => x !== id), id]))
  }, [])
  const move = useCallback((id, x, y) => setMoved((m) => ({ ...m, [id]: { x, y } })), [])
  const drop = useCallback(() => setMoved((m) => { saveMoved(layoutKey, m); return m }), [layoutKey])
  const reset = () => { setMoved({}); saveMoved(layoutKey, {}) }

  const ping = (id) => setPings((p) => ({ ...p, [id]: (p[id] || 0) + 1 }))

  // Notes float up off whichever instrument is played
  const emitFrom = (id) => (glyph) => {
    const { x, y } = posRef.current(id)
    const jitter = (Math.random() - 0.5) * 6
    setBursts((b) => [...b.slice(-14), { id: burstId++, glyph, x: x + jitter, y: y - 4 }])
  }

  // A racket sends its ball off in an arc towards the middle of the board,
  // starting from that racket's head (tennis on the left, paddle on the right)
  const racketsDir = posOf('rackets').x < 50 ? 1 : -1
  const launch = (kind) => {
    const { x, y, w } = posRef.current('rackets')
    const [ratioW, ratioH] = layout.aspect
    const headUp = ((w * 0.35) / ((100 * ratioH) / ratioW)) * 100
    const dir = x < 50 ? 1 : -1
    setBalls((b) => [...b.slice(-6), {
      id: ballId++, kind, dir,
      x: x + (kind === 'tennis' ? -0.25 : 0.25) * w,
      y: y - headUp,
      dx: dir * (16 + Math.random() * 10), dy: 3 + Math.random() * 8, h: 7 + Math.random() * 6,
    }])
  }

  const modalOpen = openPlace !== null
  useEffect(() => {
    if (!modalOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [modalOpen])

  const stickers = {
    piano: {
      label: 'Piano. Play the keys, or use A to semicolon on your keyboard',
      tape: tapeLabels.piano,
      onActivate: () => ping('piano'),
      art: <Piano emit={emitFrom('piano')} listening={!modalOpen} ping={pings.piano} />,
    },
    flute: {
      label: 'Flute. Hold a key to play a note',
      tape: tapeLabels.flute,
      onActivate: () => ping('flute'),
      art: <Flute emit={emitFrom('flute')} ping={pings.flute} />,
    },
    snare: {
      label: 'Snare drum. Hit the head, or the rim for a rimshot',
      tape: tapeLabels.snare,
      onActivate: () => ping('snare'),
      art: <Snare emit={emitFrom('snare')} ping={pings.snare} />,
    },
    ric: {
      label: ricFlipped ? 'RIC sticker, turned over. Turn it back' : 'RIC sticker. Turn it over',
      className: 'sticker--clear',
      onActivate: () => setRicFlipped((f) => !f),
      art: <RicSticker flipped={ricFlipped} />,
    },
  }
  stickers.rackets = {
    label: 'Tennis racket and pickleball paddle. Hit a ball with either one',
    onActivate: () => ping('rackets'),
    art: <RacketPair dir={racketsDir} onHit={launch} ping={pings.rackets} />,
  }
  places.forEach((place, i) => {
    stickers[place.id] = {
      label: `Stamp from ${place.location}. Open the photos, starting here`,
      className: 'sticker--stamp',
      onActivate: () => setOpenPlace(place),
      art: <Stamp place={place} cancelled={i % 3 !== 1} />,
    }
  })

  const [ratioW, ratioH] = layout.aspect

  return (
    <div className="mat-wrap">
      <div className="frame">
        <CatPerch className="cat-perch--frame" />
        <div ref={matRef} className="mat" style={{ aspectRatio: `${ratioW} / ${ratioH}` }}>
          {Object.entries(stickers).map(([id, s], i) => (
            <Sticker
              key={id}
              id={id}
              pos={posOf(id)}
              z={order.indexOf(id) + 1}
              boardRef={matRef}
              label={s.label}
              tape={s.tape}
              className={s.className}
              delay={0.1 + i * 0.045}
              shown={shown}
              onActivate={s.onActivate}
              onMove={move}
              onDrop={drop}
              onRaise={raise}
            >
              {s.art}
            </Sticker>
          ))}

          {bursts.map((b) => (
            <span
              key={b.id}
              className="mat-burst"
              style={{ left: `${b.x}%`, top: `${b.y}%` }}
              onAnimationEnd={() => setBursts((list) => list.filter((x) => x.id !== b.id))}
              aria-hidden="true"
            >
              {b.glyph}
            </span>
          ))}

          {balls.map((b) => (
            <span
              key={b.id}
              className={`mat-ball mat-ball--${b.kind}`}
              data-dir={b.dir}
              style={{ left: `${b.x}%`, top: `${b.y}%`, '--dx': `${b.dx}cqw`, '--dy': `${b.dy}cqw`, '--h': `${b.h}cqw` }}
              onAnimationEnd={(e) => {
                if (e.target === e.currentTarget) setBalls((list) => list.filter((x) => x.id !== b.id))
              }}
              aria-hidden="true"
            >
              <span className="mat-ball-arc"><Ball kind={b.kind} /></span>
            </span>
          ))}

          <div className="mat-glass" aria-hidden="true" />
        </div>
      </div>

      {Object.keys(moved).length > 0 && (
        <div className="mat-foot">
          <button type="button" onClick={reset}>Put everything back</button>
        </div>
      )}

      <AnimatePresence>
        {openPlace && (
          <PrintStack
            key="prints"
            photos={photos}
            start={photos.indexOf(openPlace.photos[0])}
            onClose={() => setOpenPlace(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
