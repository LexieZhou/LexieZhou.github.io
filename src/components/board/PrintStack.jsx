import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

// A loose tilt per print so the stack looks handled
const tilt = (i) => ((i * 37) % 11) - 5

/**
 * Every photo as a stack of prints, opened at the stamp that was clicked.
 * Flick the top print aside (or use the arrows) to get to the next one.
 */
export default function PrintStack({ photos, start, onClose }) {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(start)
  const [direction, setDirection] = useState(1)
  const count = photos.length

  const go = useCallback((step) => {
    if (count < 2) return
    setDirection(step)
    setIndex((i) => (i + step + count) % count)
  }, [count])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onClose])

  // Top print first, then up to two underneath it
  const visible = Array.from({ length: Math.min(count, 3) }, (_, depth) => {
    const i = (index + depth) % count
    return { photo: photos[i], i, depth }
  })

  return createPortal(
    <motion.div
      className="prints-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Photos"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="prints-table" onClick={(e) => e.stopPropagation()}>
        <div className="prints-stack">
          <AnimatePresence initial={!reduceMotion} custom={direction}>
            {visible.slice().reverse().map(({ photo, i, depth }) => (
              <motion.figure
                key={photo.src}
                className="print"
                custom={direction}
                style={{ zIndex: 3 - depth }}
                initial={{ opacity: 0, y: 60, rotate: tilt(i) - 10, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  x: depth * 10,
                  y: depth * -8,
                  rotate: depth === 0 ? tilt(i) / 3 : tilt(i),
                  scale: 1 - depth * 0.03,
                }}
                variants={{ away: (dir) => ({ opacity: 0, x: dir * -420, rotate: dir * -24, transition: { duration: 0.35 } }) }}
                exit="away"
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                drag={depth === 0 && count > 1 ? 'x' : false}
                dragSnapToOrigin
                onDragEnd={(_, info) => {
                  if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) go(info.offset.x < 0 ? 1 : -1)
                }}
              >
                <img src={photo.src} alt={depth === 0 ? photo.location : ''} draggable={false} />
                <figcaption>
                  <span>{photo.location}</span>
                  {count > 1 && <span>{i + 1} of {count}</span>}
                </figcaption>
              </motion.figure>
            ))}
          </AnimatePresence>
        </div>

        {count > 1 && (
          <div className="prints-nav">
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo"><ChevronLeft size={18} /></button>
            <span>Swipe the top print away for the next</span>
            <button type="button" onClick={() => go(1)} aria-label="Next photo"><ChevronRight size={18} /></button>
          </div>
        )}
      </div>

      <button type="button" className="prints-close" onClick={onClose} aria-label="Close">
        <X size={20} />
      </button>
    </motion.div>,
    document.body,
  )
}
