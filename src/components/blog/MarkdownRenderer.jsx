import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeSlug from 'rehype-slug'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import 'katex/dist/katex.min.css'
import { getNote, resolveWikilinks } from '../../data/blog'

function MarkdownLink({ href = '', children }) {
  if (href.startsWith('/blog/')) {
    // A wikilink to a note that hasn't been written yet
    if (!getNote(href.slice('/blog/'.length))) {
      return <span className="blog-missing-link" title="Not written yet">{children}</span>
    }
    return <Link to={href}>{children}</Link>
  }
  if (href.startsWith('/')) return <Link to={href}>{children}</Link>
  return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
}

const components = { a: MarkdownLink }

export default function MarkdownRenderer({ markdown }) {
  const source = useMemo(() => resolveWikilinks(markdown), [markdown])
  return (
    <div className="blog-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeSlug, rehypeKatex, [rehypeHighlight, { detect: false }]]}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </div>
  )
}
