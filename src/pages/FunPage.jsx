import { lazy, Suspense } from 'react'
import FadeInSection from '../components/FadeInSection'
import PhotoGallery from '../components/PhotoGallery'

// Lazy-load the map so Leaflet doesn't block initial render
const MemoryMap = lazy(() => import('../components/MemoryMap'))

export default function FunPage() {
  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <main>
        {/* ── Header ─────────────────────────────────────────── */}
        <section className="w-full px-6 sm:px-10 md:px-16 lg:px-24 pt-24 pb-10">
          <FadeInSection>
            <h1
              className="font-display mb-3"
              style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--text-primary)' }}
            >
              More about Zihan ⛵
            </h1>
            <p className="font-body text-base" style={{ color: 'var(--text-secondary)', maxWidth: 520 }}>
              23+ countries, a piano, a flute, and too many unfinished travel journals.
            </p>
          </FadeInSection>
        </section>

        {/* ── Memory Map ─────────────────────────────────────── */}
        <section className="w-full px-6 sm:px-10 md:px-16 lg:px-24 py-10">
          <hr className="section-divider mb-10" />
          <FadeInSection>
            <div className="flex items-baseline gap-3 mb-2">
              <h2 className="section-title" style={{ marginBottom: 0 }}>Memory Map</h2>
              <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                click a pin
              </span>
            </div>
            <p className="font-body text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Every place I've been — larger dots have photos and memories attached.
            </p>
            <Suspense fallback={
              <div style={{
                height: 480, borderRadius: 10, border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>loading map…</span>
              </div>
            }>
              <MemoryMap />
            </Suspense>
          </FadeInSection>
        </section>

        {/* ── Photo Gallery ──────────────────────────────────── */}
        <section className="w-full px-6 sm:px-10 md:px-16 lg:px-24 py-10">
          <hr className="section-divider mb-10" />
          <FadeInSection>
            <h2 className="section-title">Photos</h2>
            <PhotoGallery />
          </FadeInSection>
        </section>

        {/* ── About callouts ─────────────────────────────────── */}
        <section className="w-full px-6 sm:px-10 md:px-16 lg:px-24 py-10">
          <hr className="section-divider mb-10" />
          <FadeInSection>
            <h2 className="section-title">A few other things</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div style={{
                flex: 1, padding: '20px 24px', borderRadius: 8,
                backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)',
              }}>
                <p style={{ fontSize: 24, marginBottom: 8 }}>🎵</p>
                <p className="font-body font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                  Piano · Flute · Snare drum
                </p>
                <p className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Started piano at 6. The flute was added for school band. The snare drum was a phase, but a fun one.
                </p>
              </div>
              <div style={{
                flex: 1, padding: '20px 24px', borderRadius: 8,
                backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)',
              }}>
                <p style={{ fontSize: 24, marginBottom: 8 }}>🏛</p>
                <p className="font-body font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                  Rights & Interests Committee, HKU
                </p>
                <p className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Served as chairman of{' '}
                  <a href="https://richku.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                    RIC
                  </a>{' '}
                  in 2021–2022. Student advocacy, event organizing, and learning a lot about how to run things.
                </p>
              </div>
            </div>
          </FadeInSection>
        </section>
      </main>
    </div>
  )
}
