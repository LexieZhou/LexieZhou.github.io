import { useCallback, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import SearchPalette from './SearchPalette'

// Parent route for /blog/*: owns the ⌘K palette so every blog page shares it.
export default function BlogLayout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const openSearch = useCallback(() => setSearchOpen(true), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Outlet context={{ openSearch }} />
      <SearchPalette open={searchOpen} onClose={closeSearch} />
    </div>
  )
}
