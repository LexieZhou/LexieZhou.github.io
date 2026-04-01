import Hero from '../components/Hero'
import News from '../components/News'
import Publications from '../components/Publications'
import Experience from '../components/Experience'
import Education from '../components/Education'
import Projects from '../components/Projects'
import Skills from '../components/Skills'
import SiteVisitors from '../components/SiteVisitors'
import Footer from '../components/Footer'

export default function MainPage({ introComplete }) {
  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Hero introComplete={introComplete} />
      <News />
      <Publications />
      <Experience />
      <Education />
      <Projects />
      <Skills />
      <SiteVisitors />
      <Footer />
    </div>
  )
}
