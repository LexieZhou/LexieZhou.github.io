import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const LONG_PRESS = 280 // ms a finger has to rest before a sticker lifts
const clamp = (v) => Math.min(Math.max(v, 2), 98)

/**
 * A sticker on the mat. It can be picked up and moved: straight away with a
 * mouse, or after a long press on touch so the page still scrolls. A press
 * that doesn't move counts as a click. Anything inside marked `data-nodrag`
 * (piano keys, flute holes, the drum head) handles its own pointer events.
 */
export default function Sticker({
  id, pos, z, boardRef, label, tape, className = '', delay = 0, shown,
  onActivate, onMove, onDrop, onRaise, children,
}) {
  const reduceMotion = useReducedMotion()
  const ref = useRef(null)
  const press = useRef(null)
  const [lifted, setLifted] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [settled, setSettled] = useState(false)

  // Once a touch has lifted the sticker, the finger moves it instead of the page
  useEffect(() => {
    const el = ref.current
    const block = (e) => { if (press.current?.armed) e.preventDefault() }
    el.addEventListener('touchmove', block, { passive: false })
    return () => el.removeEventListener('touchmove', block)
  }, [])

  const onPointerDown = (e) => {
    if (e.button !== 0) return
    onRaise(id)
    if (e.target.closest('[data-nodrag]')) return
    const touch = e.pointerType === 'touch'
    press.current = {
      pointerId: e.pointerId, touch,
      startX: e.clientX, startY: e.clientY, x: pos.x, y: pos.y,
      rect: boardRef.current.getBoundingClientRect(),
      armed: !touch, moved: false, timer: null,
    }
    if (touch) {
      press.current.timer = setTimeout(() => {
        if (!press.current) return
        press.current.armed = true
        setLifted(true)
        navigator.vibrate?.(8)
      }, LONG_PRESS)
    }
  }

  const onPointerMove = (e) => {
    const p = press.current
    if (!p || p.pointerId !== e.pointerId) return
    const dx = e.clientX - p.startX
    const dy = e.clientY - p.startY
    const dist = Math.hypot(dx, dy)
    if (!p.armed) {
      // The finger moved before the long press: that's a scroll
      if (dist > 8) { clearTimeout(p.timer); press.current = null }
      return
    }
    if (!p.moved) {
      if (dist < 4) return
      p.moved = true
      ref.current.setPointerCapture(e.pointerId)
      setLifted(true)
      setDragging(true)
    }
    onMove(id, clamp(p.x + (dx / p.rect.width) * 100), clamp(p.y + (dy / p.rect.height) * 100))
  }

  const endPress = (e, cancelled) => {
    const p = press.current
    if (!p || p.pointerId !== e.pointerId) return
    press.current = null
    clearTimeout(p.timer)
    setLifted(false)
    setDragging(false)
    if (p.moved) onDrop(id)
    // A long press that never moved just puts the sticker back down
    else if (!cancelled && !(p.touch && p.armed)) onActivate?.(e)
  }

  const onKeyDown = (e) => {
    if (e.target !== e.currentTarget) return
    if ((e.key === 'Enter' || e.key === ' ') && onActivate) {
      e.preventDefault()
      onActivate(e)
      return
    }
    const step = e.shiftKey ? 5 : 1
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    if (moves[e.key]) {
      e.preventDefault()
      onRaise(id)
      onMove(id, clamp(pos.x + moves[e.key][0]), clamp(pos.y + moves[e.key][1]))
      onDrop(id)
    }
  }

  return (
    <div
      ref={ref}
      className={`sticker ${className}${dragging ? ' is-dragging' : ''}`}
      style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: `${pos.w}cqw`, zIndex: z, '--w': pos.w }}
      role="button"
      tabIndex={0}
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endPress(e, false)}
      onPointerCancel={(e) => endPress(e, true)}
      onKeyDown={onKeyDown}
      onContextMenu={(e) => e.preventDefault()}
    >
      <motion.div
        className={`sticker-body${lifted ? ' is-lifted' : ''}`}
        initial={reduceMotion ? false : { opacity: 0, scale: 1.45, rotate: pos.r + 14 }}
        animate={shown || reduceMotion
          ? { opacity: 1, scale: lifted ? 1.07 : 1, rotate: pos.r + (lifted ? 2.5 : 0) }
          : undefined}
        transition={{ type: 'spring', stiffness: 520, damping: 26, delay: settled ? 0 : delay }}
        onAnimationComplete={() => setSettled(true)}
      >
        {children}
        {tape && <span className="sticker-tape">{tape}</span>}
      </motion.div>
    </div>
  )
}
