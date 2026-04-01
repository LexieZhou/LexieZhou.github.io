import FadeInSection from './FadeInSection'
import { experience } from '../data/content'

export default function Experience() {
  return (
    <section id="experience" className="w-full px-6 sm:px-10 md:px-16 lg:px-24 py-12">
      <hr className="section-divider mb-10" />
      <FadeInSection>
        <h2 className="section-title">Experience</h2>
        <div className="space-y-0">
          {experience.map((item, i) => (
            <div key={i} className="timeline-item pb-6">
              <div className="timeline-line">
                <div className="timeline-dot" />
                {i < experience.length - 1 && <div className="timeline-connector" />}
              </div>
              <div className="flex-1">
                <p
                  className="font-body font-medium text-sm mb-0.5"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {item.role}
                </p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                  <a
                    href={item.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-sm hover:underline"
                    style={{ color: 'var(--accent)' }}
                  >
                    {item.company}
                  </a>
                  <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                    · {item.location}
                  </span>
                  <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                    · {item.dates}
                  </span>
                </div>
                {item.note && (
                  <p className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>
                    {item.noteUrl ? (
                      <>
                        Supervised by{' '}
                        <a
                          href={item.noteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                          style={{ color: 'var(--accent)' }}
                        >
                          {item.note.replace('Supervised by ', '')}
                        </a>
                      </>
                    ) : (
                      item.note
                    )}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </FadeInSection>
    </section>
  )
}
