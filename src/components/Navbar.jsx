import { useState, useEffect } from 'react'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const sectionLinks = [
  { label: 'About', href: '#hero' },
  { label: 'News', href: '#news' },
  { label: 'Publications', href: '#publications' },
  { label: 'Experience', href: '#experience' },
  { label: 'Education', href: '#education' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
]

export default function Navbar({ isDark, toggleDark }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isFun = location.pathname === '/fun'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname])

  const scrollTo = (e, hash) => {
    e.preventDefault()
    setMenuOpen(false)
    if (isFun) {
      // Navigate home first, then scroll after mount
      navigate('/')
      setTimeout(() => {
        const el = document.querySelector(hash)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      const el = document.querySelector(hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const navStyle = {
    backgroundColor: scrolled
      ? `color-mix(in srgb, var(--bg-primary) 90%, transparent)`
      : 'var(--bg-primary)',
    borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
    backdropFilter: scrolled ? 'blur(12px)' : 'none',
    WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
    transition: 'border-color 0.2s ease, backdrop-filter 0.2s ease',
  }

  const linkStyle = (active = false) => ({
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.875rem',
    textDecoration: 'none',
    transition: 'color 0.15s ease',
  })

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
        <div className="hidden md:flex items-center gap-6">
          {sectionLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => scrollTo(e, link.href)}
              style={linkStyle(false)}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/fun"
            style={{
              ...linkStyle(false),
              color: isFun ? 'var(--accent)' : 'var(--text-secondary)',
              backgroundColor: isFun ? 'var(--accent-subtle)' : 'transparent',
              padding: '3px 10px',
              borderRadius: 9999,
              border: `1px solid ${isFun ? 'var(--border)' : 'transparent'}`,
              transition: 'color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent)'
              e.currentTarget.style.backgroundColor = 'var(--accent-subtle)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = isFun ? 'var(--accent)' : 'var(--text-secondary)'
              e.currentTarget.style.backgroundColor = isFun ? 'var(--accent-subtle)' : 'transparent'
              e.currentTarget.style.borderColor = isFun ? 'var(--border)' : 'transparent'
            }}
          >
            ⛵ Fun
          </Link>
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
          {sectionLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => scrollTo(e, link.href)}
              className="font-display text-2xl"
              style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/fun"
            className="font-display text-2xl"
            style={{ color: isFun ? 'var(--accent)' : 'var(--text-primary)', textDecoration: 'none' }}
            onClick={() => setMenuOpen(false)}
          >
            ⛵ Fun
          </Link>
        </div>
      )}
    </>
  )
}
