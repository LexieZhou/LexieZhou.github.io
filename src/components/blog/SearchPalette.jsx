import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { notes, getNote, searchIndex, snippet } from '../../data/blog'

function Results({ query, onPick }) {
  const [selected, setSelected] = useState(0)
  const listRef = useRef(null)

  const results = useMemo(() => {
    if (!query.trim()) return notes.slice(0, 6).map((note) => ({ note, terms: [] }))
    return searchIndex.search(query).slice(0, 8).map((r) => ({ note: getNote(r.id), terms: r.terms }))
  }, [query])

  useEffect(() => setSelected(0), [query])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((i) => Math.min(i + 1, results.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((i) => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && results[selected]) onPick(results[selected].note.slug)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [results, selected, onPick])

  useEffect(() => {
    listRef.current?.children[selected]?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  if (!results.length) {
    return (
      <p className="font-body text-sm px-5 py-6" style={{ color: 'var(--text-muted)' }}>
        {query.trim() ? `No notes match “${query}”.` : 'No notes yet.'}
      </p>
    )
  }

  return (
    <ul ref={listRef} className="max-h-[50vh] overflow-y-auto py-2" style={{ listStyle: 'none', margin: 0 }}>
      {results.map(({ note, terms }, i) => (
        <li
          key={note.slug}
          onMouseEnter={() => setSelected(i)}
          onClick={() => onPick(note.slug)}
          className="px-5 py-3 cursor-pointer"
          style={{ backgroundColor: i === selected ? 'var(--accent-subtle)' : 'transparent' }}
        >
          <div className="flex items-baseline gap-3">
            <span className="font-body text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{note.title}</span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {note.tags.map((t) => `#${t}`).join(' ')}
            </span>
          </div>
          <p className="font-body text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {snippet(note, terms).map(([text, hit], j) =>
              hit ? <mark key={j} className="blog-mark">{text}</mark> : <span key={j}>{text}</span>
            )}
          </p>
        </li>
      ))}
    </ul>
  )
}

export default function SearchPalette({ open, onClose }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    setQuery('')
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const pick = (slug) => {
    onClose()
    navigate(`/blog/${slug}`)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-start justify-center px-4 pt-[14vh]"
          style={{ zIndex: 1100, backgroundColor: 'rgba(0, 0, 0, 0.35)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-label="Search notes"
            className="w-full max-w-[560px] overflow-hidden"
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}
            initial={{ y: -8, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center gap-3 px-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes…"
                className="w-full py-4 bg-transparent outline-none font-body text-sm"
                style={{ color: 'var(--text-primary)' }}
              />
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                esc
              </kbd>
            </div>
            <Results query={query} onPick={pick} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
