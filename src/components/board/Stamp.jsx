import { useId } from 'react'

const thumbOf = (src) => src.replace('/img/fun/', '/img/fun/thumbs/')

function Postmark({ text }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className="postmark" viewBox="0 0 120 80" aria-hidden="true">
      <path id={id} d="M18 40 A22 22 0 1 1 62 40 A22 22 0 1 1 18 40" fill="none" />
      <circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="40" cy="40" r="17" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <text className="postmark-text"><textPath href={`#${id}`}>{text}</textPath></text>
      <g fill="none" stroke="currentColor" strokeWidth="2">
        {[34, 46].map((y) => <path key={y} d={`M72 ${y} q6 -5 12 0 t12 0 t12 0 t12 0`} />)}
      </g>
    </svg>
  )
}

// A postage stamp for one place. The value printed in the corner is how many photos are inside.
export default function Stamp({ place, cancelled }) {
  const [city, country] = place.location.split(', ')
  return (
    <div className={`stamp-wrap stamp--${place.region.toLowerCase()}`}>
      <div className="stamp">
        <div className="stamp-frame">
          <img src={thumbOf(place.photos[0].src)} alt="" loading="lazy" draggable={false} />
          <span className="stamp-value">{place.photos.length}</span>
        </div>
        <span className="stamp-city">{city}</span>
      </div>
      {cancelled && <Postmark text={`${country || place.region}  ✦  ${city}  ✦`} />}
    </div>
  )
}
