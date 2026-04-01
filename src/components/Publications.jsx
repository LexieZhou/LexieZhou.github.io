import FadeInSection from './FadeInSection'
import { publications } from '../data/content'

export default function Publications() {
  return (
    <section id="publications" className="w-full px-6 sm:px-10 md:px-16 lg:px-24 py-12">
      <hr className="section-divider mb-10" />
      <FadeInSection>
        <h2 className="section-title">Publications</h2>
        <div className="space-y-5">
          {publications.map((pub, i) => (
            <div
              key={i}
              className="pl-4 py-1"
              style={{ borderLeft: '2px solid var(--accent)' }}
            >
              <a
                href={pub.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body font-medium text-sm leading-snug block mb-1.5 hover:underline"
                style={{ color: 'var(--text-primary)' }}
              >
                {pub.title}
              </a>
              <p className="font-body text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                {pub.authors.map((author, j) => (
                  <span key={j}>
                    {j > 0 && ', '}
                    {author === 'Zihan Zhou' ? (
                      <strong style={{ color: 'var(--text-primary)' }}>{author}</strong>
                    ) : (
                      author
                    )}
                  </span>
                ))}
              </p>
              <span className="accent-pill">{pub.venue}</span>
            </div>
          ))}
        </div>
      </FadeInSection>
    </section>
  )
}
