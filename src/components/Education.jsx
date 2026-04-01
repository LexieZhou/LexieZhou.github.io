import FadeInSection from './FadeInSection'
import { education } from '../data/content'

export default function Education() {
  return (
    <section id="education" className="w-full px-6 sm:px-10 md:px-16 lg:px-24 py-12">
      <hr className="section-divider mb-10" />
      <FadeInSection>
        <h2 className="section-title">Education</h2>
        <div className="space-y-0 mb-6">
          {education.map((item, i) => (
            <div key={i} className="timeline-item pb-5">
              <div className="timeline-line">
                <div className="timeline-dot" />
                {i < education.length - 1 && <div className="timeline-connector" />}
              </div>
              <div className="flex-1">
                <a
                  href={item.institutionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body font-medium text-sm hover:underline"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {item.institution}
                </a>
                <p className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {item.degree}
                </p>
                <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  {item.dates}
                </p>
              </div>
            </div>
          ))}
        </div>
      </FadeInSection>
    </section>
  )
}
