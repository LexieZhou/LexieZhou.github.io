import { useState, useEffect } from 'react'
import { Sun, Moon, Menu, X } from 'lucide-react'

const navLinks = [
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (e, href) => {
    e.preventDefault()
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center px-6"
        style={{
          backgroundColor: scrolled
            ? `color-mix(in srgb, var(--bg-primary) 90%, transparent)`
            : 'var(--bg-primary)',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
          transition: 'border-color 0.2s ease, backdrop-filter 0.2s ease',
        }}
      >
        {/* Left: Name */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, '#hero')}
          className="font-mono text-sm tracking-widest uppercase mr-auto"
          style={{ color: 'var(--text-primary)' }}
        >
          Zihan Zhou
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="font-body text-sm transition-colors duration-150"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--text-secondary)')}
            >
              {link.label}
            </a>
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

      {/* Mobile overlay menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 md:hidden"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="font-display text-2xl"
              style={{ color: 'var(--text-primary)' }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </>
  )
}
