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
// Stamps sit in one cluster per region, west to east: America, Europe, Asia. Spots are
// taken in the order the places appear in photos.js, and inside a cluster each stamp
// roughly keeps its place on a map (Swiss Alps top left of Europe, Santorini bottom right).
const desktopStamps = {
  America: [[10.5, 62, -5], [20.5, 63.8, 4], [11, 84, 3], [21, 86, -4]],
  Europe: [[56, 64, 3], [51, 86, 5], [46, 61.8, -4], [61, 84.5, -2], [66, 62.3, -6], [41, 84.5, -3], [36, 63.8, 5]],
  Asia: [[80.5, 85, 4], [90.5, 61.8, -5], [90.5, 85.5, -3], [80.5, 63.3, 6]],
}

const mobileStamps = {
  America: [[14, 57.3, -5], [38, 56.8, 4], [62, 57.6, -3], [86, 57, 5]],
  Europe: [[62, 70, 3], [50, 79.2, 5], [38, 69.4, -4], [74, 79.8, -2], [86, 69.9, -6], [26, 79.6, -3], [14, 69.5, 5]],
  Asia: [[38, 92.4, 4], [86, 92.8, -5], [62, 92.6, -3], [14, 92.9, 6]],
}

const withStamps = (base, stamps, w) => {
  const taken = {}
  return {
    ...base,
    ...Object.fromEntries(places.map((p) => {
      // A region without its own cluster borrows spots from all of them
      const spots = stamps[p.region] ?? Object.values(stamps).flat()
      const n = taken[p.region] = (taken[p.region] ?? -1) + 1
      const [x, y, r] = spots[n % spots.length]
      return [p.id, { x, y, r, w }]
    })),
  }
}

export const layouts = {
  desktop: {
    aspect: [3, 2],
    stickers: withStamps({
      piano:      { x: 19, y: 15,   r: -3,  w: 30 },
      flute:      { x: 75, y: 10.5, r: 3,   w: 34 },
      ric:        { x: 14, y: 38.5, r: -5,  w: 16 },
      snare:      { x: 47, y: 31.5, r: 6,   w: 14 },
      rackets:    { x: 80, y: 36,   r: 6,   w: 19 },
    }, desktopStamps, 9),
  },
  mobile: {
    aspect: [18, 55],
    stickers: withStamps({
      flute:      { x: 50, y: 4.1,  r: 3,   w: 84 },
      piano:      { x: 47, y: 13.2, r: -3,  w: 74 },
      ric:        { x: 28, y: 25.4, r: -5,  w: 40 },
      snare:      { x: 74, y: 26.5, r: 6,   w: 36 },
      rackets:    { x: 50, y: 42.7, r: 4,   w: 46 },
    }, mobileStamps, 20),
  },
}

export const tapeLabels = {
  piano: 'Piano, since I was six',
  flute: 'Flute, for the school band',
  snare: 'Snare drum, a fun phase',
}
