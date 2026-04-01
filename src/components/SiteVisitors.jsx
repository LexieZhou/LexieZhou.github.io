import { useEffect, useRef } from 'react'
import FadeInSection from './FadeInSection'

export default function SiteVisitors() {
  const containerRef = useRef(null)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current || !containerRef.current) return
    loaded.current = true

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.id = 'clustrmaps'
    script.src =
      '//cdn.clustrmaps.com/map_v2.js?cl=4e53a3&w=300&t=tt&d=jXrCsSAQ5cxkeQ3lCox56aF4RFmd75evDhWXbEo3EbM&co=b5abc6&ct=442525&cmo=5583f2&cmn=49db49'
    containerRef.current.appendChild(script)
  }, [])

  return (
    <section id="visitors" className="w-full px-6 sm:px-10 md:px-16 lg:px-24 py-12">
      <hr className="section-divider mb-10" />
      <FadeInSection>
        <h2 className="section-title">Site Visitors</h2>
        <div ref={containerRef} />
      </FadeInSection>
    </section>
  )
}
