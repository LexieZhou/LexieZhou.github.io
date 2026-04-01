import { useState } from 'react'
import { useDarkMode } from './hooks/useDarkMode'
import CameraIntro from './components/CameraIntro'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import News from './components/News'
import Publications from './components/Publications'
import Experience from './components/Experience'
import Education from './components/Education'
import Projects from './components/Projects'
import Skills from './components/Skills'
import SiteVisitors from './components/SiteVisitors'
import Footer from './components/Footer'

export default function App() {
  const [isDark, setIsDark] = useDarkMode()
  const [introComplete, setIntroComplete] = useState(false)

  return (
    <>
      {!introComplete && (
        <CameraIntro onComplete={() => setIntroComplete(true)} />
      )}
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          minHeight: '100vh',
        }}
      >
        <Navbar isDark={isDark} toggleDark={() => setIsDark((d) => !d)} />
        <main>
          <Hero introComplete={introComplete} />
          <News />
          <Publications />
          <Experience />
          <Education />
          <Projects />
          <Skills />
          <SiteVisitors />
        </main>
        <Footer />
      </div>
    </>
  )
}
