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
  [38, 44, -6], [48, 41, 4], [58, 45, -2], [68, 40, 7],
  [34, 62, 3], [44, 59, -4], [54, 63, 6], [64, 58, -3], [74, 63, 5],
  [17, 83, -3], [29, 80, 5], [41, 83, -6], [53, 79, 2], [65, 82, -4], [77, 79, 6],
]

const mobileStamps = [
  [26, 48, -5], [50, 47.5, 6], [74, 48.5, -3],
  [14, 61, 4], [38, 60.5, -3], [62, 61.5, 5], [86, 60.5, -6],
  [14, 74, -4], [38, 73.5, 6], [62, 74.5, -2], [86, 73.5, 4],
  [14, 87, 5], [38, 86.5, -5], [62, 87.5, 3], [86, 86.5, -3],
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
      piano:  { x: 24, y: 21, r: -3, w: 30 },
      flute:  { x: 66, y: 14, r: 4,  w: 36 },
      snare:  { x: 86, y: 41, r: 7,  w: 15 },
      ric:    { x: 17, y: 56, r: -5, w: 17 },
    }, desktopStamps, 8),
  },
  mobile: {
    aspect: [9, 24],
    stickers: withStamps({
      flute:  { x: 50, y: 4.5, r: 3,  w: 84 },
      piano:  { x: 47, y: 17,  r: -3, w: 74 },
      ric:    { x: 29, y: 32,  r: -5, w: 40 },
      snare:  { x: 74, y: 33,  r: 6,  w: 36 },
    }, mobileStamps, 20),
  },
}

export const tapeLabels = {
  piano: 'Piano, since I was six',
  flute: 'Flute, for the school band',
  snare: 'Snare drum, a fun phase',
}
