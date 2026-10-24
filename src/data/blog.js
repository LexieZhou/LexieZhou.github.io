import MiniSearch from 'minisearch'

// Every note is a Markdown file in src/content/blog/; the filename is its slug.
// Files starting with `_` (like _template.md) are skipped.
const files = import.meta.glob(['../content/blog/*.md', '!../content/blog/_*.md'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

const WIKILINK = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

// Run fn over the prose only, leaving fenced and inline code untouched.
const mapOutsideCode = (md, fn) =>
  md.split(/(```[\s\S]*?```|`[^`\n]*`)/g).map((part, i) => (i % 2 ? part : fn(part))).join('')

// Minimal frontmatter: `key: value` lines, with `[a, b]` for lists.
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { data: {}, body: raw }
  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*(.*?)(\s+#.*)?$/)
    if (!m) continue
    let value = m[2].trim()
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean)
    } else if (value === 'true' || value === 'false') {
      value = value === 'true'
    } else {
      value = value.replace(/^["']|["']$/g, '')
    }
    data[m[1]] = value
  }
  return { data, body: raw.slice(match[0].length) }
}

// Rough plain text for search and word counts
const toPlainText = (md) =>
  md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g, ' ')
    .replace(WIKILINK, (_, slug, label) => label || slug)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~$|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const allNotes = Object.entries(files).map(([path, raw]) => {
  const slug = path.split('/').pop().replace(/\.md$/, '')
  const { data, body } = parseFrontmatter(raw)
  const links = []
  mapOutsideCode(body, (text) => {
    for (const m of text.matchAll(WIKILINK)) links.push(m[1].trim())
    return text
  })
  const plainText = toPlainText(body)
  return {
    slug,
    title: data.title || slug,
    date: data.date || '',
    tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
    summary: data.summary || '',
    draft: data.draft === true,
    body,
    links: [...new Set(links)],
    plainText,
    readingTime: Math.max(1, Math.round(plainText.split(' ').length / 200)),
  }
})

export const notes = allNotes
  .filter((n) => !(import.meta.env.PROD && n.draft))
  .sort((a, b) => b.date.localeCompare(a.date))

const bySlug = new Map(notes.map((n) => [n.slug, n]))

export const getNote = (slug) => bySlug.get(slug)

// [[slug]] / [[slug|label]] → ordinary Markdown links the renderer turns into router links
export const resolveWikilinks = (md) =>
  mapOutsideCode(md, (text) =>
    text.replace(WIKILINK, (_, slug, label) => {
      slug = slug.trim()
      if (import.meta.env.DEV && !bySlug.has(slug)) console.warn(`[blog] wikilink to missing note: ${slug}`)
      return `[${(label || bySlug.get(slug)?.title || slug).trim()}](/blog/${slug})`
    })
  )

export const allTags = (() => {
  const counts = new Map()
  for (const n of notes) for (const t of n.tags) counts.set(t, (counts.get(t) || 0) + 1)
  return [...counts].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
})()

// Fresh objects on every call: the force graph mutates nodes and links in place.
export function buildGraph() {
  const nodes = notes.map((n) => ({ id: n.slug, type: 'note', label: n.title }))
  const links = []
  for (const { tag } of allTags) nodes.push({ id: `tag:${tag}`, type: 'tag', label: `#${tag}` })
  for (const n of notes) {
    for (const t of n.tags) links.push({ source: n.slug, target: `tag:${t}` })
    for (const l of n.links) if (bySlug.has(l) && l !== n.slug) links.push({ source: n.slug, target: l })
  }
  const degree = new Map()
  for (const l of links) {
    degree.set(l.source, (degree.get(l.source) || 0) + 1)
    degree.set(l.target, (degree.get(l.target) || 0) + 1)
  }
  for (const node of nodes) node.degree = degree.get(node.id) || 0
  return { nodes, links }
}

export const searchIndex = new MiniSearch({
  idField: 'slug',
  fields: ['title', 'tags', 'plainText'],
  extractField: (doc, field) => (field === 'tags' ? doc.tags.join(' ') : doc[field]),
  searchOptions: { boost: { title: 3, tags: 2 }, prefix: true, fuzzy: 0.2 },
})
searchIndex.addAll(notes)

// A short excerpt around the first matched term, split into [text, isMatch] pieces
export function snippet(note, terms, radius = 60) {
  const text = note.plainText
  const lower = text.toLowerCase()
  let at = -1
  for (const t of terms) {
    const i = lower.indexOf(t.toLowerCase())
    if (i !== -1 && (at === -1 || i < at)) at = i
  }
  if (at === -1) return [[note.summary || text.slice(0, radius * 2), false]]
  const start = Math.max(0, at - radius)
  const excerpt = (start > 0 ? '…' : '') + text.slice(start, at + radius * 2) + (at + radius * 2 < text.length ? '…' : '')
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return excerpt.split(new RegExp(`(${escaped.join('|')})`, 'gi')).filter(Boolean)
    .map((part) => [part, terms.some((t) => t.toLowerCase() === part.toLowerCase())])
}

export const formatDate = (iso, opts = { month: 'short', day: 'numeric' }) =>
  iso ? new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' }) : ''
