import FadeInSection from './FadeInSection'
import { news } from '../data/content'

export default function News() {
  return (
    <section id="news" className="w-full px-6 sm:px-10 md:px-16 lg:px-24 py-12">
      <hr className="section-divider mb-10" />
      <FadeInSection>
        <h2 className="section-title">News</h2>
        <div
          className="news-scroll space-y-4"
          style={{
            borderRadius: '6px',
          }}
        >
          {news.map((item, i) => (
            <div key={i} className="flex gap-4 items-baseline">
              <span
                className="font-mono text-xs flex-shrink-0 w-20"
                style={{ color: item.highlight ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                {item.date}
              </span>
              <div
                className="flex-1"
                style={{
                  borderLeft: '2px solid var(--border)',
                  paddingLeft: '1rem',
                }}
              >
                <p
                  className="font-body text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </FadeInSection>
    </section>
  )
}
