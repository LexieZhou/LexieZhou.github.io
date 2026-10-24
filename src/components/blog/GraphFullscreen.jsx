import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import BlogGraph from './BlogGraph'

function useViewportHeight() {
  const [height, setHeight] = useState(() => window.innerHeight)
  useEffect(() => {
    const onResize = () => setHeight(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return height
}

export default function GraphFullscreen({ open, onClose, onTagClick }) {
  const height = useViewportHeight()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0"
          style={{ zIndex: 1100, backgroundColor: 'var(--bg-primary)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-label="Knowledge graph"
        >
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 h-[60px] pointer-events-none" style={{ zIndex: 1 }}>
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Knowledge graph · scroll to zoom · drag to pan
            </p>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md pointer-events-auto"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Close graph"
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <X size={18} />
            </button>
          </div>
          <BlogGraph height={height} interactive onTagClick={onTagClick} onNavigate={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
