import { useState, useEffect } from 'react'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const pages = [
  { label: 'Home', to: '/', isActive: (path) => path === '/' },
  { label: 'Blog', to: '/blog', isActive: (path) => path.startsWith('/blog') },
  { label: '⛵ Fun', to: '/fun', isActive: (path) => path === '/fun' },
]

const linkStyle = (active = false) => ({
  color: active ? 'var(--accent)' : 'var(--text-secondary)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.875rem',
  textDecoration: 'none',
  transition: 'color 0.15s ease',
})

// Pill link to a page, filled while that page is open
function NavPill({ to, active, children }) {
  const rest = {
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    backgroundColor: active ? 'var(--accent-subtle)' : 'transparent',
    borderColor: active ? 'var(--border)' : 'transparent',
  }
  return (
    <Link
      to={to}
      style={{
        ...linkStyle(active),
        backgroundColor: rest.backgroundColor,
        padding: '3px 10px',
        borderRadius: 9999,
        border: `1px solid ${rest.borderColor}`,
        transition: 'color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--accent)'
        e.currentTarget.style.backgroundColor = 'var(--accent-subtle)'
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
      onMouseLeave={(e) => Object.assign(e.currentTarget.style, rest)}
    >
      {children}
    </Link>
  )
}

export default function Navbar({ isDark, toggleDark }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname])

  const navStyle = {
    backgroundColor: scrolled
      ? `color-mix(in srgb, var(--bg-primary) 90%, transparent)`
      : 'var(--bg-primary)',
    borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
    backdropFilter: scrolled ? 'blur(12px)' : 'none',
    WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
    transition: 'border-color 0.2s ease, backdrop-filter 0.2s ease',
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-[60px] flex items-center px-6" style={{ ...navStyle, zIndex: 1001 }}>
        {/* Logo → home */}
        <Link
          to="/"
          className="font-mono text-sm tracking-widest uppercase mr-auto"
          style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
        >
          Zihan Zhou
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-2">
          {pages.map((page) => (
            <NavPill key={page.to} to={page.to} active={page.isActive(location.pathname)}>
              {page.label}
            </NavPill>
          ))}
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="ml-6 p-1.5 rounded-md transition-colors duration-150"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Toggle dark mode"
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-3 p-1.5"
          onClick={() => setMenuOpen((o) => !o)}
          style={{ color: 'var(--text-muted)' }}
          aria-label="Open menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 flex flex-col items-center justify-center gap-8 md:hidden"
          style={{ backgroundColor: 'var(--bg-primary)', zIndex: 1000 }}
        >
          {pages.map((page) => (
            <Link
              key={page.to}
              to={page.to}
              className="font-display text-2xl"
              style={{
                color: page.isActive(location.pathname) ? 'var(--accent)' : 'var(--text-primary)',
                textDecoration: 'none',
              }}
              onClick={() => setMenuOpen(false)}
            >
              {page.label}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
