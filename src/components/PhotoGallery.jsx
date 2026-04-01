import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { photos } from '../data/photos'

const REGIONS = ['All', 'Europe', 'Asia', 'America']

// ── Lightbox ─────────────────────────────────────────────────────
function Lightbox({ photos, index, onClose, onPrev, onNext }) {
  const photo = photos[index]

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onPrev, onNext, onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(14,14,12,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Image */}
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', maxWidth: '90vw', maxHeight: '88vh' }}
      >
        <img
          src={photo.src}
          alt={photo.location}
          style={{ maxWidth: '90vw', maxHeight: '82vh', objectFit: 'contain', borderRadius: 4, display: 'block' }}
        />
        <p style={{
          textAlign: 'center', marginTop: 10,
          fontFamily: "'DM Mono', monospace", fontSize: 11,
          color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em',
        }}>
          {photo.location}
        </p>
      </motion.div>

      {/* Controls */}
      <button onClick={(e) => { e.stopPropagation(); onPrev() }} style={navBtnStyle('left')}>
        <ChevronLeft size={20} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onNext() }} style={navBtnStyle('right')}>
        <ChevronRight size={20} />
      </button>
      <button onClick={onClose} style={{
        position: 'absolute', top: '1.5rem', right: '1.5rem',
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'rgba(255,255,255,0.6)',
      }}>
        <X size={20} />
      </button>

      {/* Counter */}
      <div style={{
        position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        fontFamily: "'DM Mono', monospace", fontSize: 10,
        color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em',
      }}>
        {index + 1} / {photos.length}
      </div>
    </motion.div>
  )
}

function navBtnStyle(side) {
  return {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    [side]: '1.5rem',
    background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
    width: 40, height: 40, cursor: 'pointer', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
}

// ── Gallery grid ─────────────────────────────────────────────────
export default function PhotoGallery() {
  const [activeRegion, setActiveRegion] = useState('All')
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const filtered = activeRegion === 'All' ? photos : photos.filter((p) => p.region === activeRegion)

  const openLightbox = (index) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const prevPhoto = useCallback(() => setLightboxIndex((i) => (i - 1 + filtered.length) % filtered.length), [filtered.length])
  const nextPhoto = useCallback(() => setLightboxIndex((i) => (i + 1) % filtered.length), [filtered.length])

  return (
    <>
      {/* Filter row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => { setActiveRegion(r); setLightboxIndex(null) }}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.65rem',
              padding: '3px 10px',
              borderRadius: 9999,
              border: '1px solid transparent',
              cursor: 'pointer',
              backgroundColor: activeRegion === r ? 'var(--accent)' : 'var(--accent-subtle)',
              color: activeRegion === r ? 'var(--bg-primary)' : 'var(--accent)',
              transition: 'all 0.15s ease',
            }}
          >
            {r}
          </button>
        ))}
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: 10,
          color: 'var(--text-muted)', alignSelf: 'center', marginLeft: 4,
        }}>
          {filtered.length} photos
        </span>
      </div>

      {/* Masonry grid */}
      <div style={{
        columns: '3 200px',
        columnGap: '12px',
      }}>
        {filtered.map((photo, i) => (
          <motion.div
            key={photo.src}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
            onClick={() => openLightbox(i)}
            className="masonry-item"
          >
            <img
              src={photo.src}
              alt={photo.location}
              loading="lazy"
              style={{ width: '100%', display: 'block', borderRadius: 6 }}
            />
            <div className="masonry-overlay">
              <span>{photo.location}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            photos={filtered}
            index={lightboxIndex}
            onClose={closeLightbox}
            onPrev={prevPhoto}
            onNext={nextPhoto}
          />
        )}
      </AnimatePresence>
    </>
  )
}
