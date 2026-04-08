import { useState } from 'react'
import { ExternalLink, Github, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import FadeInSection from './FadeInSection'
import { projects } from '../data/content'

const CATEGORIES = ['All', 'AI / ML', 'Full-Stack', 'CV & AR']

function FilterButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="font-mono text-[0.65rem] px-2.5 py-0.5 rounded-full transition-all duration-200"
      style={{
        backgroundColor: active ? 'var(--accent)' : 'var(--accent-subtle)',
        color: active ? 'var(--bg-primary)' : 'var(--accent)',
        border: '1px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.borderColor = 'var(--accent)'
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.borderColor = 'transparent'
      }}
    >
      {label}
    </button>
  )
}

function CategoryBadge({ category }) {
  const colors = {
    'AI / ML':     { bg: '#EDE8E0', text: '#7C6F5B' },
    'Full-Stack':  { bg: '#E8EDF0', text: '#5B6F7C' },
    'CV & AR':     { bg: '#EDE8F0', text: '#6F5B7C' },
  }
  const dark = {
    'AI / ML':     { bg: '#2A2720', text: '#C4AD8A' },
    'Full-Stack':  { bg: '#1E2428', text: '#8AADC4' },
    'CV & AR':     { bg: '#24202A', text: '#AD8AC4' },
  }
  const style = colors[category] || colors['AI / ML']

  return (
    <span
      className="font-mono text-[0.65rem] px-2 py-0.5 rounded-full"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {category}
    </span>
  )
}

function LinkIcon({ href, icon: Icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 font-mono text-[0.65rem] px-2 py-1 rounded transition-colors duration-150"
      style={{
        color: 'var(--text-muted)',
        backgroundColor: 'var(--bg-tertiary)',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--accent)'
        e.currentTarget.style.backgroundColor = 'var(--accent-subtle)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-muted)'
        e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
      }}
    >
      <Icon size={11} />
      {label}
    </a>
  )
}

function ProjectCard({ project }) {
  const hasLinks = project.github || project.paper || project.demo

  const inner = (
    <div className="project-card h-full flex flex-col">
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3
          className="font-display text-base leading-snug mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {project.title}
        </h3>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <CategoryBadge category={project.category} />
          <span className="accent-pill">{project.tag}</span>
        </div>
        <p
          className="font-body text-sm leading-relaxed flex-1 mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          {project.description}
        </p>
        {hasLinks && (
          <div className="flex items-center gap-2 flex-wrap pt-2" style={{ borderTop: '1px solid var(--border)' }}>
            {project.github && (
              <LinkIcon href={project.github} icon={Github} label="Code" />
            )}
            {project.paper && (
              <LinkIcon href={project.paper} icon={FileText} label={project.paperLabel || 'Paper'} />
            )}
            {project.demo && (
              <LinkIcon href={project.demo} icon={ExternalLink} label="Demo" />
            )}
          </div>
        )}
      </div>
    </div>
  )

  return <div className="h-full">{inner}</div>
}

export default function Projects() {
  const [active, setActive] = useState('All')

  const filtered = active === 'All'
    ? projects
    : projects.filter((p) => p.category === active)

  return (
    <section id="projects" className="w-full px-6 sm:px-10 md:px-16 lg:px-24 py-12">
      <hr className="section-divider mb-14" />
      <FadeInSection>
        <div className="flex items-center gap-4 flex-wrap mb-8">
          <h2 className="section-title" style={{ marginBottom: 0 }}>Selected Projects</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <FilterButton
                key={cat}
                label={cat}
                active={active === cat}
                onClick={() => setActive(cat)}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.div
                key={project.title}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </FadeInSection>
    </section>
  )
}
