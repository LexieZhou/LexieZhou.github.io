import { useState } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useDarkMode } from './hooks/useDarkMode'
import CameraIntro from './components/CameraIntro'
import Navbar from './components/Navbar'
import MainPage from './pages/MainPage'
import FunPage from './pages/FunPage'

function AppContent({ isDark, toggleDark, introComplete, setIntroComplete }) {
  const location = useLocation()
  const isMain = location.pathname === '/'

  return (
    <>
      {isMain && !introComplete && (
        <CameraIntro onComplete={() => setIntroComplete(true)} />
      )}
      <Navbar isDark={isDark} toggleDark={toggleDark} />
      <Routes>
        <Route path="/" element={<MainPage introComplete={introComplete} />} />
        <Route path="/fun" element={<FunPage />} />
      </Routes>
    </>
  )
}

export default function App() {
  const [isDark, setIsDark] = useDarkMode()
  const [introComplete, setIntroComplete] = useState(false)

  return (
    <HashRouter>
      <AppContent
        isDark={isDark}
        toggleDark={() => setIsDark((d) => !d)}
        introComplete={introComplete}
        setIntroComplete={setIntroComplete}
      />
    </HashRouter>
  )
}
