import { useMemo, useState } from 'react'
import { Link, useOutletContext, useSearchParams } from 'react-router-dom'
import { Maximize2, Search } from 'lucide-react'
import BlogGraph from '../components/blog/BlogGraph'
import GraphFullscreen from '../components/blog/GraphFullscreen'
import { notes, allTags, formatDate } from '../data/blog'

const muted = { color: 'var(--text-muted)' }

function TagFilter({ activeTag, setTag }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
      {[null, ...allTags.map((t) => t.tag)].map((tag) => {
        const active = activeTag === tag
        return (
          <button
            key={tag ?? 'all'}
            onClick={() => setTag(tag)}
            style={{
              color: active ? 'var(--text-primary)' : 'var(--text-muted)',
              textDecoration: active ? 'underline' : 'none',
              textUnderlineOffset: 4,
            }}
          >
            {tag ? `#${tag}` : 'all'}
          </button>
        )
      })}
    </div>
  )
}

function NoteRow({ note }) {
  return (
    <Link to={`/blog/${note.slug}`} className="blog-row flex gap-6 py-3" style={{ color: 'inherit' }}>
      <span className="font-mono text-xs pt-1 w-14 shrink-0" style={muted}>{formatDate(note.date)}</span>
      <div className="min-w-0">
        <h3 className="blog-row-title font-body text-base" style={{ color: 'var(--text-primary)' }}>{note.title}</h3>
        {note.summary && (
          <p className="font-body text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{note.summary}</p>
        )}
      </div>
    </Link>
  )
}

export default function BlogPage() {
  const { openSearch } = useOutletContext()
  const [params, setParams] = useSearchParams()
  const activeTag = params.get('tag')
  const [graphOpen, setGraphOpen] = useState(false)

  const setTag = (tag) => setParams(tag ? { tag } : {}, { replace: true })

  const byYear = useMemo(() => {
    const groups = new Map()
    for (const n of notes) {
      if (activeTag && !n.tags.includes(activeTag)) continue
      const year = n.date.slice(0, 4) || 'Undated'
      if (!groups.has(year)) groups.set(year, [])
      groups.get(year).push(n)
    }
    return [...groups]
  }, [activeTag])

  return (
    <main className="max-w-[960px] mx-auto px-6 sm:px-10 pt-24 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--text-primary)' }}>
          Blog
        </h1>
        <button
          onClick={openSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ ...muted, border: '1px solid var(--border)' }}
          aria-label="Search notes"
        >
          <Search size={14} />
          <kbd className="hidden sm:inline font-mono text-[11px]">⌘K</kbd>
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="font-body text-sm" style={muted}>No notes yet.</p>
      ) : (
        <>
          <div className="relative mb-8" style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            <BlogGraph height={340} onTagClick={setTag} />
            <button
              onClick={() => setGraphOpen(true)}
              className="absolute top-2.5 right-2.5 p-1.5 rounded"
              style={muted}
              aria-label="Expand graph"
              title="Expand graph"
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Maximize2 size={14} />
            </button>
          </div>

          {allTags.length > 0 && (
            <div className="mb-8">
              <TagFilter activeTag={activeTag} setTag={setTag} />
            </div>
          )}

          {byYear.length === 0 && (
            <p className="font-body text-sm" style={muted}>No notes tagged #{activeTag}.</p>
          )}

          {byYear.map(([year, group]) => (
            <div key={year} className="mb-8">
              <p className="font-mono text-xs mb-1" style={muted}>{year}</p>
              {group.map((n) => <NoteRow key={n.slug} note={n} />)}
            </div>
          ))}
        </>
      )}

      <GraphFullscreen open={graphOpen} onClose={() => setGraphOpen(false)} onTagClick={setTag} />
    </main>
  )
}
