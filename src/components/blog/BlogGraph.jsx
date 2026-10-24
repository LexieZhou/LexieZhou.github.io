import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ForceGraph2D from 'react-force-graph-2d'
import { buildGraph } from '../../data/blog'

const VARS = ['--accent', '--text-primary', '--text-muted', '--border', '--bg-primary']

const readColors = () => {
  const style = getComputedStyle(document.documentElement)
  return Object.fromEntries(VARS.map((v) => [v, style.getPropertyValue(v).trim()]))
}

// Re-read the palette whenever the `dark` class on <html> flips
function useThemeColors() {
  const [colors, setColors] = useState(readColors)
  useEffect(() => {
    const observer = new MutationObserver(() => setColors(readColors()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return colors
}

function useWidth(ref) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref])
  return width
}

const withAlpha = (hex, alpha) => {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

const endId = (end) => (typeof end === 'object' ? end.id : end)
const radiusOf = (node) => (node.type === 'tag' ? 2.5 : 2.5 + Math.sqrt(node.degree) * 0.8)

// Fit everything in view, but don't blow a small graph up to giant nodes
const MAX_FIT_ZOOM = 2.2
function fit(graph, padding) {
  if (!graph) return
  graph.zoomToFit(0, padding)
  if (graph.zoom() > MAX_FIT_ZOOM) graph.zoom(MAX_FIT_ZOOM, 0)
}

// `interactive` turns on zoom and pan (fullscreen); the sidebar graph lets the page scroll.
export default function BlogGraph({ height, interactive = false, onTagClick, onNavigate }) {
  const containerRef = useRef(null)
  const graphRef = useRef(null)
  const width = useWidth(containerRef)
  const colors = useThemeColors()
  const navigate = useNavigate()
  const data = useMemo(buildGraph, [])
  const [hovered, setHovered] = useState(null)

  const neighbors = useMemo(() => {
    const map = new Map()
    for (const l of data.links) {
      const s = endId(l.source), t = endId(l.target)
      if (!map.has(s)) map.set(s, new Set())
      if (!map.has(t)) map.set(t, new Set())
      map.get(s).add(t)
      map.get(t).add(s)
    }
    return map
  }, [data])

  useEffect(() => {
    graphRef.current?.d3Force('charge')?.strength(interactive ? -120 : -60)
    graphRef.current?.d3Force('link')?.distance(interactive ? 50 : 30)
  }, [interactive, width])

  const isLit = useCallback(
    (id) => !hovered || id === hovered || neighbors.get(hovered)?.has(id),
    [hovered, neighbors]
  )

  const drawNode = useCallback(
    (node, ctx, scale) => {
      const r = radiusOf(node)
      ctx.globalAlpha = isLit(node.id) ? 1 : 0.15
      ctx.beginPath()
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI)
      if (node.type === 'tag') {
        ctx.fillStyle = colors['--bg-primary']
        ctx.fill()
        ctx.lineWidth = 1.2 / scale
        ctx.strokeStyle = colors['--text-muted']
        ctx.stroke()
      } else {
        ctx.fillStyle = colors['--accent']
        ctx.fill()
      }
      // Labels appear once zoomed in, or around the hovered node
      const showLabel = (hovered && isLit(node.id)) || scale > 1.4
      if (showLabel) {
        const fontSize = Math.max(11 / scale, 2.5)
        ctx.font = `${node.type === 'tag' ? '' : '500 '}${fontSize}px 'DM Sans', sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillStyle = colors[node.type === 'tag' ? '--text-muted' : '--text-primary']
        ctx.fillText(node.label, node.x, node.y + r + 2 / scale)
      }
      ctx.globalAlpha = 1
    },
    [colors, hovered, isLit, interactive]
  )

  const paintPointerArea = useCallback((node, color, ctx) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(node.x, node.y, radiusOf(node) + 3, 0, 2 * Math.PI)
    ctx.fill()
  }, [])

  const linkColor = useCallback(
    (link) => {
      if (!hovered) return colors['--border']
      const s = endId(link.source), t = endId(link.target)
      return s === hovered || t === hovered ? withAlpha(colors['--accent'], 0.7) : withAlpha(colors['--border'], 0.3)
    },
    [colors, hovered]
  )

  const handleClick = useCallback(
    (node) => {
      onNavigate?.()
      if (node.type === 'tag') onTagClick?.(node.id.slice('tag:'.length))
      else navigate(`/blog/${node.id}`)
    },
    [navigate, onTagClick, onNavigate]
  )

  const fitted = useRef(false)

  // Keep the graph framed when the container is resized after the first fit
  useEffect(() => {
    if (fitted.current) fit(graphRef.current, interactive ? 80 : 40)
  }, [width, height, interactive])

  return (
    <div ref={containerRef} style={{ width: '100%', height, cursor: hovered ? 'pointer' : 'default' }}>
      {width > 0 && (
        <ForceGraph2D
          ref={graphRef}
          graphData={data}
          width={width}
          height={height}
          backgroundColor="rgba(0,0,0,0)"
          nodeRelSize={1}
          nodeCanvasObject={drawNode}
          nodePointerAreaPaint={paintPointerArea}
          nodeLabel={() => ''}
          linkColor={linkColor}
          linkWidth={(l) => (hovered && (endId(l.source) === hovered || endId(l.target) === hovered) ? 1.4 : 0.8)}
          onNodeHover={(node) => setHovered(node?.id ?? null)}
          onNodeClick={handleClick}
          enableZoomInteraction={interactive}
          enablePanInteraction={interactive}
          enableNodeDrag
          autoPauseRedraw={false}
          cooldownTicks={120}
          onEngineStop={() => {
            if (fitted.current) return
            fitted.current = true
            fit(graphRef.current, interactive ? 80 : 40)
          }}
        />
      )}
    </div>
  )
}
