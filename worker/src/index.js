/**
 * Site visitor map — Cloudflare Worker backend.
 *
 * Visitors, one endpoint with two jobs:
 *   GET /api/visitors            → the public aggregate, as JSON
 *   GET /api/visitors?record=1   → count this request first, then return it
 *
 * Pets for the nap cat, kept apart from the visitor tally:
 *   GET  /api/pets               → { total, petters }
 *   POST /api/pets  {n, first}   → add n pets (and one petter if first), then return it
 *
 * Cloudflare hands every request an approximate location in `request.cf`, so
 * there is no geo-IP service and no API key in play. Nothing that identifies a
 * person is read or stored: no IP address, no user agent, no cookie — only a
 * city-level tally.
 *
 * State lives in a single KV entry. That means a read-modify-write per recorded
 * visit, so two hits landing in the same instant can lose one of the two. For a
 * visitor map that is a fine trade for staying inside the KV free tier; move to
 * a Durable Object if the count ever needs to be exact.
 */

const AGGREGATE_KEY = 'aggregate'
const PETS_KEY = 'pets'
const MAX_PETS_PER_REQUEST = 30
const MAX_CITIES = 600
const MAX_RECENT = 12

/** Origins allowed to read the aggregate. */
const ALLOWED_ORIGINS = [
  'https://yichenzw.com',
  'https://www.yichenzw.com',
  'https://lexiezhou.github.io',
  'http://localhost:5173',
  'http://localhost:4173',
]

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin') || ''
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      'Vary': 'Origin',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          ...cors,
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    if (url.pathname === '/api/pets' && (request.method === 'GET' || request.method === 'POST')) {
      return pets(request, env, cors)
    }

    if (request.method !== 'GET' || url.pathname !== '/api/visitors') {
      return json({ error: 'not found' }, 404, cors)
    }

    let state = (await env.VISITORS.get(AGGREGATE_KEY, 'json')) || { total: 0, cities: {}, recent: [] }

    if (url.searchParams.get('record') === '1') {
      const place = readPlace(request)
      if (place) {
        state = record(state, place)
        await env.VISITORS.put(AGGREGATE_KEY, JSON.stringify(state))
      }
    }

    return json(publicView(state), 200, {
      ...cors,
      // Cache reads briefly so a burst of visitors doesn't hammer KV.
      'Cache-Control': 'public, max-age=60',
    })
  },
}

/**
 * Reads or bumps the pet tally. The page batches clicks, so one request may
 * carry several pets; `first` is sent once per browser so `petters` counts
 * people rather than clicks. Same single-key KV trade-off as the visitor map.
 */
async function pets(request, env, cors) {
  let state = (await env.VISITORS.get(PETS_KEY, 'json')) || { total: 0, petters: 0 }

  if (request.method === 'POST') {
    // The page posts text/plain to stay a simple CORS request, so parse by hand.
    const body = await request.json().catch(() => null)
    const n = Math.min(MAX_PETS_PER_REQUEST, Math.max(0, Math.floor(Number(body?.n) || 0)))
    if (n > 0) {
      state = {
        total: state.total + n,
        petters: state.petters + (body.first === true ? 1 : 0),
      }
      await env.VISITORS.put(PETS_KEY, JSON.stringify(state))
    }
  }

  return json(state, 200, { ...cors, 'Cache-Control': 'no-store' })
}

/** Pulls the coarse location Cloudflare attached to the request, if it is usable. */
function readPlace(request) {
  const cf = request.cf
  if (!cf || !cf.city || cf.latitude == null || cf.longitude == null) return null

  const lat = Number(cf.latitude)
  const lon = Number(cf.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null

  return {
    city: String(cf.city).slice(0, 64),
    region: cf.region ? String(cf.region).slice(0, 64) : '',
    cc: cf.country ? String(cf.country).slice(0, 2).toUpperCase() : '',
    lat: Math.round(lat * 100) / 100,
    lon: Math.round(lon * 100) / 100,
  }
}

/** Folds one visit into the aggregate, returning the updated state. */
function record(state, place) {
  const key = `${place.cc}|${place.region}|${place.city}`
  const now = Date.now()
  const existing = state.cities[key]

  state.cities[key] = existing
    ? { ...existing, n: existing.n + 1, last: now }
    : { ...place, n: 1, first: now, last: now }

  state.total = (state.total || 0) + 1
  state.recent = [{ city: place.city, cc: place.cc, t: now }, ...(state.recent || [])].slice(0, MAX_RECENT)

  const keys = Object.keys(state.cities)
  if (keys.length > MAX_CITIES) {
    // Evict the quietest, oldest cities first so the busy ones survive.
    keys
      .sort((a, b) => state.cities[a].n - state.cities[b].n || state.cities[a].last - state.cities[b].last)
      .slice(0, keys.length - MAX_CITIES)
      .forEach((k) => delete state.cities[k])
  }

  return state
}

/** Shapes the stored state into the payload the map consumes. */
function publicView(state) {
  const cities = Object.values(state.cities || {})
    .map(({ city, region, cc, lat, lon, n, last }) => ({ city, region, cc, lat, lon, n, last }))
    .sort((a, b) => b.n - a.n)

  return {
    total: state.total || 0,
    countries: new Set(cities.map((c) => c.cc).filter(Boolean)).size,
    cities,
    recent: state.recent || [],
  }
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  })
}
