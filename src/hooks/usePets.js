import { useCallback, useEffect, useRef, useState } from 'react'
import { visitorApi } from '../data/content'

const PETS_API = visitorApi ? visitorApi.replace(/\/visitors$/, '/pets') : null
const FLUSH_DELAY = 1500

/**
 * Counts pets for the nap cat. The first pet goes out right away so the
 * tally can show; later ones are batched to spare the worker's KV writes.
 * Returns [tally, pet] where tally is { total, petters } or null until the
 * worker has answered once.
 */
export function usePets() {
  const [server, setServer] = useState(null)
  const [unsent, setUnsent] = useState(0)
  const pending = useRef(0)
  const inFlight = useRef(0)
  const timer = useRef(0)
  const lastFlush = useRef(0)

  const flush = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = 0
    const n = pending.current
    if (!n || !PETS_API) return
    pending.current = 0
    inFlight.current += n
    lastFlush.current = Date.now()

    let first = false
    try {
      first = !localStorage.getItem('cat-petted')
      if (first) localStorage.setItem('cat-petted', '1')
    } catch {
      // Storage can throw in private browsing; count the pets, skip the petter.
    }

    // A string body is sent as text/plain, which keeps this a simple CORS
    // request (no preflight), and keepalive lets it outlive a closing tab.
    fetch(PETS_API, { method: 'POST', body: JSON.stringify({ n, first }), keepalive: true })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.status))))
      .then((data) => setServer(data))
      .catch(() => {})
      .finally(() => {
        inFlight.current -= n
        setUnsent(inFlight.current + pending.current)
      })
  }, [])

  const pet = useCallback(() => {
    pending.current += 1
    setUnsent(inFlight.current + pending.current)
    if (timer.current) return
    const wait = Math.max(0, FLUSH_DELAY - (Date.now() - lastFlush.current))
    timer.current = setTimeout(flush, wait)
  }, [flush])

  useEffect(() => {
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [flush])

  const tally = server ? { total: server.total + unsent, petters: server.petters } : null
  return [tally, pet]
}
