import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { memories } from '../data/memories'

// ── Custom marker icons ──────────────────────────────────────────
function makeIcon(hasPhotos) {
  const size = hasPhotos ? 13 : 9
  const color = hasPhotos ? '#7C6F5B' : '#C2B9B0'
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2px solid white;
      box-shadow:0 1px 5px rgba(0,0,0,0.28);cursor:pointer;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// ── Popup card ───────────────────────────────────────────────────
function MemoryCard({ pin, onClose }) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const hasPhotos = pin.photos && pin.photos.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(360px, calc(100vw - 3rem))',
        zIndex: 1000,
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
        overflow: 'hidden',
      }}
    >
      {/* Photo strip */}
      {hasPhotos && (
        <div style={{ position: 'relative', aspectRatio: '16/9', background: 'var(--bg-tertiary)' }}>
          <img
            src={pin.photos[photoIndex]}
            alt={pin.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {pin.photos.length > 1 && (
            <>
              <button
                onClick={() => setPhotoIndex((i) => (i - 1 + pin.photos.length) % pin.photos.length)}
                style={{
                  position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%',
                  width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'white',
                }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPhotoIndex((i) => (i + 1) % pin.photos.length)}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%',
                  width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'white',
                }}
              >
                <ChevronRight size={14} />
              </button>
              <div style={{
                position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: 4,
              }}>
                {pin.photos.map((_, i) => (
                  <div key={i} style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: i === photoIndex ? 'white' : 'rgba(255,255,255,0.4)',
                  }} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Text content */}
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <span style={{ fontSize: 16, marginRight: 6 }}>{pin.flag}</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              {pin.name}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px 0 0 8px', lineHeight: 1 }}
          >
            <X size={14} />
          </button>
        </div>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.6,
          color: 'var(--text-secondary)', margin: 0,
        }}>
          {pin.memory}
        </p>
      </div>
    </motion.div>
  )
}

// ── Map click-away handler ───────────────────────────────────────
function MapClickAway({ onClose }) {
  useMapEvents({ click: onClose })
  return null
}

// ── Main component ───────────────────────────────────────────────
export default function MemoryMap() {
  const [selected, setSelected] = useState(null)

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid var(--border)',
        height: 480,
      }}>
        <MapContainer
          center={[30, 20]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          zoomControl={true}
          attributionControl={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapClickAway onClose={() => setSelected(null)} />
          {memories.map((pin) => (
            <Marker
              key={pin.id}
              position={pin.coords}
              icon={makeIcon(!!pin.photos)}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation()
                  setSelected(pin)
                },
              }}
            />
          ))}
        </MapContainer>
      </div>

      {/* Floating card — rendered outside the map container */}
      <AnimatePresence>
        {selected && (
          <MemoryCard pin={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginTop: 12, paddingLeft: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#7C6F5B', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>place with photos</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#C2B9B0', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>place visited</span>
        </div>
      </div>
    </div>
  )
}
