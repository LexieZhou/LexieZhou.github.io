# Visitor map backend

A Cloudflare Worker that counts page views by city and serves the aggregate to the
`Site Visitors` section on the site. Cloudflare attaches an approximate location to
every request (`request.cf`), so there is no geo-IP provider and no API key. Only a
city-level tally is stored — no IP addresses, user agents, or cookies.

Free tier is plenty: 100k requests/day and 1k KV writes/day, and the site records at
most one visit per browser session.

## Deploy

```bash
cd worker
npx wrangler login

# 1. Create the KV namespace, then paste the printed id into wrangler.toml
npx wrangler kv namespace create VISITORS

# 2. Ship it
npx wrangler deploy
```

Wrangler prints a URL like `https://visitor-map.<your-subdomain>.workers.dev`.
Put the endpoint into [`src/data/content.js`](../src/data/content.js):

```js
export const visitorApi = 'https://visitor-map.<your-subdomain>.workers.dev/api/visitors'
```

Then `npm run build` and push. Until that constant is set, the map renders without a
counter and says so.

## Endpoint

| Request | Effect |
|---|---|
| `GET /api/visitors` | Returns the aggregate. Cached 60s. |
| `GET /api/visitors?record=1` | Counts this request first, then returns the aggregate. |

Response shape:

```json
{
  "total": 1284,
  "countries": 37,
  "cities": [{ "city": "Hong Kong", "region": "", "cc": "HK", "lat": 22.28, "lon": 114.16, "n": 91, "last": 1756339200000 }],
  "recent": [{ "city": "Zurich", "cc": "CH", "t": 1756339200000 }]
}
```

## Notes

- `ALLOWED_ORIGINS` in [`src/index.js`](src/index.js) gates CORS. Add any new domain
  the site is served from.
- State is one KV entry, read-modify-written per recorded visit. Two visits in the
  same instant can collapse into one. That is an acceptable trade for a visitor map;
  switch to a Durable Object if the count ever has to be exact.
- The tally is capped at 600 cities (quietest evicted first) and 12 recent arrivals.
- To reset: `npx wrangler kv key delete --binding VISITORS aggregate --remote`
