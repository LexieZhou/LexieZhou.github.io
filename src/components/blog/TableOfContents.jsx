import { useEffect, useState } from 'react'

// With HashRouter, href="#id" would replace the route, so scroll from JS instead.
const scrollToHeading = (e, id) => {
  e.preventDefault()
  const el = document.getElementById(id)
  if (!el) return
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' })
}

// The active heading is the last one scrolled above the top third of the screen,
// or the final heading once the page bottoms out (short last sections never reach the top).
function useActiveHeading(headings) {
  const [active, setActive] = useState(null)
  useEffect(() => {
    if (!headings.length) return
    let frame = 0
    const update = () => {
      frame = 0
      const els = headings.map((h) => document.getElementById(h.id)).filter(Boolean)
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      const passed = els.filter((el) => el.getBoundingClientRect().top < window.innerHeight / 3)
      setActive((atBottom ? els[els.length - 1] : passed[passed.length - 1] ?? els[0])?.id ?? null)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [headings])
  return active
}

function HeadingList({ headings, active }) {
  return (
    <ul className="font-body text-sm space-y-1.5" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {headings.map((h) => (
        <li key={h.id} style={{ paddingLeft: h.level === 3 ? 12 : 0 }}>
          <a
            href={`#${h.id}`}
            onClick={(e) => scrollToHeading(e, h.id)}
            style={{
              color: active === h.id ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: active === h.id ? 500 : 400,
              transition: 'color 0.15s ease',
            }}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  )
}

// `variant="sidebar"` is the sticky desktop outline, `variant="inline"` the collapsible mobile box.
export default function TableOfContents({ headings, variant }) {
  const active = useActiveHeading(headings)
  if (!headings.length) return null

  if (variant === 'inline') {
    return (
      <details
        className="blog-toc-inline mb-8"
        style={{ border: '1px solid var(--border)', borderRadius: 8, backgroundColor: 'var(--bg-secondary)', padding: '10px 16px' }}
      >
        <summary className="font-mono text-xs uppercase tracking-widest cursor-pointer" style={{ color: 'var(--text-muted)' }}>
          Contents
        </summary>
        <div className="mt-3">
          <HeadingList headings={headings} active={active} />
        </div>
      </details>
    )
  }

  return (
    <nav aria-label="Outline">
      <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
        On this page
      </p>
      <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 14 }}>
        <HeadingList headings={headings} active={active} />
      </div>
    </nav>
  )
}
