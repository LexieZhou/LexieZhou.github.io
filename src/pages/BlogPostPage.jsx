import { useLayoutEffect, useEffect, useRef, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'
import MarkdownRenderer from '../components/blog/MarkdownRenderer'
import TableOfContents from '../components/blog/TableOfContents'
import { getNote, formatDate } from '../data/blog'

const backLink = (
  <Link to="/blog" className="inline-flex items-center gap-1.5 font-body text-sm" style={{ color: 'var(--text-muted)' }}>
    <ArrowLeft size={14} /> All notes
  </Link>
)

export default function BlogPostPage() {
  const { slug } = useParams()
  const { openSearch } = useOutletContext()
  const note = getNote(slug)
  const articleRef = useRef(null)
  const [headings, setHeadings] = useState([])

  // Read the outline from the rendered headings so ids always match rehype-slug's
  useLayoutEffect(() => {
    const els = articleRef.current?.querySelectorAll('h2[id], h3[id]') ?? []
    setHeadings([...els].map((el) => ({ id: el.id, text: el.textContent, level: el.tagName === 'H3' ? 3 : 2 })))
  }, [slug])

  useEffect(() => {
    if (!note) return
    const prev = document.title
    document.title = `${note.title} · Zihan Zhou`
    return () => { document.title = prev }
  }, [note])

  if (!note) {
    return (
      <main className="max-w-[720px] mx-auto px-6 pt-32 pb-20">
        <h1 className="font-display text-3xl mb-4" style={{ color: 'var(--text-primary)' }}>Note not found</h1>
        <p className="font-body text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          There's no note called “{slug}”.
        </p>
        {backLink}
      </main>
    )
  }

  return (
    <main className="max-w-[1000px] mx-auto px-6 sm:px-10 pt-24 pb-20">
      <div className="flex items-center justify-between mb-8">
        {backLink}
        <button onClick={openSearch} className="p-1.5" style={{ color: 'var(--text-muted)' }} aria-label="Search notes">
          <Search size={15} />
        </button>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,720px)_200px] gap-12 justify-between">
        <article ref={articleRef} className="min-w-0">
          <header className="mb-8">
            <h1 className="font-display mb-4" style={{ fontSize: 'clamp(1.9rem, 4.5vw, 2.6rem)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {note.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                {formatDate(note.date, { year: 'numeric', month: 'long', day: 'numeric' })} · {note.readingTime} min read
              </span>
              {note.tags.map((t) => (
                <Link key={t} to={`/blog?tag=${encodeURIComponent(t)}`} className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>#{t}</Link>
              ))}
            </div>
          </header>

          <div className="lg:hidden">
            <TableOfContents headings={headings} variant="inline" />
          </div>

          <MarkdownRenderer key={slug} markdown={note.body} />
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TableOfContents headings={headings} variant="sidebar" />
          </div>
        </aside>
      </div>
    </main>
  )
}
