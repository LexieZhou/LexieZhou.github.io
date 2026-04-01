import { Github, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full px-6 sm:px-10 md:px-16 lg:px-24 py-8 mt-8">
      <hr className="section-divider mb-6" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
          © 2026 Zihan Zhou
        </p>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/LexieZhou"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-150"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            aria-label="GitHub"
          >
            <Github size={15} />
          </a>
          <a
            href="https://www.linkedin.com/in/zhzhou02/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-150"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            aria-label="LinkedIn"
          >
            <Linkedin size={15} />
          </a>
          <a
            href="/fun"
            className="font-mono text-xs transition-colors duration-150"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            ✦ Fun
          </a>
        </div>
      </div>
    </footer>
  )
}
