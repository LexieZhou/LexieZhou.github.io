import FadeInSection from './FadeInSection'
import { skills } from '../data/content'

export default function Skills() {
  return (
    <section id="skills" className="w-full px-6 sm:px-10 md:px-16 lg:px-24 py-12">
      <hr className="section-divider mb-10" />
      <FadeInSection>
        <h2 className="section-title">Skills</h2>
        <div className="space-y-5">
          {skills.map((group) => (
            <div key={group.label} className="flex flex-col sm:flex-row sm:gap-6">
              <p
                className="font-mono text-xs w-28 flex-shrink-0 mb-2 sm:mb-0 mt-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span key={item} className="accent-pill">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </FadeInSection>
    </section>
  )
}
