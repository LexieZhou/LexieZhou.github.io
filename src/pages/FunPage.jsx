import FadeInSection from '../components/FadeInSection'
import Board from '../components/board/Board'
import NapCat from '../components/NapCat'

export default function FunPage({ isDark }) {
  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <main className="w-full px-4 sm:px-10 md:px-16 lg:px-24 pt-24 pb-16">
        <FadeInSection>
          <h1
            className="font-display mb-3"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--text-primary)' }}
          >
            More about Zihan
          </h1>
          <p className="font-body text-base mb-12" style={{ color: 'var(--text-secondary)', maxWidth: 520 }}>
            I love music, traveling, photography, and exploring new things.
          </p>
        </FadeInSection>
        <Board />
        <NapCat isDark={isDark} />
      </main>
    </div>
  )
}
