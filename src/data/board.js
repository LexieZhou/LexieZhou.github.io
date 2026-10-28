import { photos } from './photos'

// One postage stamp per place, in the order the places appear in photos.js
export const places = photos.reduce((list, photo) => {
  const found = list.find((p) => p.location === photo.location)
  if (found) found.photos.push(photo)
  else list.push({ id: `stamp-${list.length}`, location: photo.location, region: photo.region, photos: [photo] })
  return list
}, [])

// Sticker placement inside the frame. x/y are the sticker's centre as % of the mat,
// w is its width as % of the mat's width (cqw), r is its resting tilt.
const desktopStamps = [
  [34, 45, -6], [44, 42, 4], [54, 46, -2], [64, 41, 7], [74, 45, -4],
  [30, 63, 3], [40, 60, -4], [50, 64, 6], [60, 59, -3], [70, 63, 5],
  [26, 82, -3], [37, 79, 5], [48, 83, -6], [59, 79, 2], [70, 82, -4],
]

const mobileStamps = [
  [26, 59, -5], [50, 58.5, 6], [74, 59.5, -3],
  [14, 70.5, 4], [38, 70, -3], [62, 71, 5], [86, 70, -6],
  [14, 82, -4], [38, 81.5, 6], [62, 82.5, -2], [86, 81.5, 4],
  [14, 93.5, 5], [38, 93, -5], [62, 94, 3], [86, 93, -3],
]

const withStamps = (base, stamps, w) => ({
  ...base,
  ...Object.fromEntries(places.map((p, i) => {
    const [x, y, r] = stamps[i % stamps.length]
    return [p.id, { x, y, r, w }]
  })),
})

export const layouts = {
  desktop: {
    aspect: [3, 2],
    stickers: withStamps({
      piano:      { x: 21, y: 19, r: -3,  w: 30 },
      snare:      { x: 47, y: 21, r: 6,   w: 14 },
      flute:      { x: 74, y: 12, r: 4,   w: 34 },
      ric:        { x: 15, y: 58, r: -5,  w: 17 },
      rackets:    { x: 88, y: 60, r: 6,   w: 19 },
    }, desktopStamps, 8),
  },
  mobile: {
    aspect: [9, 28],
    stickers: withStamps({
      flute:      { x: 50, y: 4,  r: 3,   w: 84 },
      piano:      { x: 47, y: 13, r: -3,  w: 74 },
      ric:        { x: 28, y: 25, r: -5,  w: 40 },
      snare:      { x: 74, y: 26, r: 6,   w: 36 },
      rackets:    { x: 50, y: 42, r: 4,   w: 46 },
    }, mobileStamps, 20),
  },
}

export const tapeLabels = {
  piano: 'Piano, since I was six',
  flute: 'Flute, for the school band',
  snare: 'Snare drum, a fun phase',
}
