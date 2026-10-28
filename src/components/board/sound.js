// Small Web Audio synths for the instruments on the board. Nothing is loaded
// up front: the audio context starts on the first sticker that makes a sound.

let ctx = null
let master = null
let noiseBuffer = null

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    ctx = new AC()
    master = ctx.createDynamicsCompressor()
    master.threshold.value = -14
    master.ratio.value = 6
    master.connect(ctx.destination)

    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12)

function noise(ac) {
  const src = ac.createBufferSource()
  src.buffer = noiseBuffer
  src.loop = true
  return src
}

// ── Piano: a few decaying partials through a closing low-pass ────
export function playPiano(midi) {
  const ac = audio()
  const t = ac.currentTime
  const f = hz(midi)

  const env = ac.createGain()
  env.gain.setValueAtTime(0, t)
  env.gain.linearRampToValueAtTime(0.3, t + 0.006)
  env.gain.exponentialRampToValueAtTime(0.08, t + 0.35)
  env.gain.exponentialRampToValueAtTime(0.0001, t + 2.2)

  const lp = ac.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(f * 7, t)
  lp.frequency.exponentialRampToValueAtTime(f * 1.6, t + 1.2)
  env.connect(lp).connect(master)

  ;[[1, 1, 'triangle'], [2, 0.35, 'sine'], [3, 0.14, 'sine'], [4.01, 0.06, 'sine']].forEach(([h, g, type]) => {
    const o = ac.createOscillator()
    o.type = type
    o.frequency.value = f * h
    const gain = ac.createGain()
    gain.gain.value = g
    o.connect(gain).connect(env)
    o.start(t)
    o.stop(t + 2.3)
  })
}

// ── Flute: a held, breathy sine with vibrato that can glide ──────
export function startFlute(midi) {
  const ac = audio()
  const t = ac.currentTime
  const f = hz(midi)

  const env = ac.createGain()
  env.gain.setValueAtTime(0, t)
  env.gain.linearRampToValueAtTime(0.2, t + 0.09)
  env.connect(master)

  const tone = ac.createOscillator()
  tone.type = 'sine'
  tone.frequency.value = f
  const overtone = ac.createOscillator()
  overtone.type = 'sine'
  overtone.frequency.value = f * 2
  const overGain = ac.createGain()
  overGain.gain.value = 0.12

  // Vibrato fades in, the way a player settles into a note
  const lfo = ac.createOscillator()
  lfo.frequency.value = 5.2
  const depth = ac.createGain()
  depth.gain.setValueAtTime(0, t)
  depth.gain.linearRampToValueAtTime(f * 0.006, t + 0.4)
  lfo.connect(depth)
  depth.connect(tone.frequency)

  const breath = noise(ac)
  const band = ac.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = f * 2
  band.Q.value = 1.2
  const breathGain = ac.createGain()
  breathGain.gain.value = 0.05

  tone.connect(env)
  overtone.connect(overGain).connect(env)
  breath.connect(band).connect(breathGain).connect(env)
  ;[tone, overtone, lfo, breath].forEach((n) => n.start(t))

  let stopped = false
  return {
    setNote(next) {
      const now = ac.currentTime
      const nf = hz(next)
      tone.frequency.setTargetAtTime(nf, now, 0.02)
      overtone.frequency.setTargetAtTime(nf * 2, now, 0.02)
      band.frequency.setTargetAtTime(nf * 2, now, 0.02)
      depth.gain.setTargetAtTime(nf * 0.006, now, 0.1)
    },
    stop() {
      if (stopped) return
      stopped = true
      const now = ac.currentTime
      env.gain.cancelScheduledValues(now)
      env.gain.setTargetAtTime(0, now, 0.05)
      ;[tone, overtone, lfo, breath].forEach((n) => n.stop(now + 0.4))
    },
  }
}

// ── Snare: noise crack over a short falling tone ─────────────────
export function playSnare({ rim = false } = {}) {
  const ac = audio()
  const t = ac.currentTime

  const crack = noise(ac)
  const hp = ac.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = rim ? 2400 : 1200
  const crackGain = ac.createGain()
  crackGain.gain.setValueAtTime(rim ? 0.35 : 0.6, t)
  crackGain.gain.exponentialRampToValueAtTime(0.001, t + (rim ? 0.06 : 0.2))
  crack.connect(hp).connect(crackGain).connect(master)
  crack.start(t)
  crack.stop(t + 0.25)

  const body = ac.createOscillator()
  body.type = rim ? 'square' : 'triangle'
  body.frequency.setValueAtTime(rim ? 880 : 200, t)
  body.frequency.exponentialRampToValueAtTime(rim ? 600 : 120, t + 0.08)
  const bodyGain = ac.createGain()
  bodyGain.gain.setValueAtTime(rim ? 0.25 : 0.4, t)
  bodyGain.gain.exponentialRampToValueAtTime(0.001, t + (rim ? 0.04 : 0.12))
  body.connect(bodyGain).connect(master)
  body.start(t)
  body.stop(t + 0.15)
}

// ── Rackets: a different contact sound for each ball ─────────────
export function playHit(kind) {
  const ac = audio()
  const t = ac.currentTime

  const burst = (filterType, freq, q, gain, decay) => {
    const src = noise(ac)
    const filter = ac.createBiquadFilter()
    filter.type = filterType
    filter.frequency.value = freq
    filter.Q.value = q
    const g = ac.createGain()
    g.gain.setValueAtTime(gain, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + decay)
    src.connect(filter).connect(g).connect(master)
    src.start(t)
    src.stop(t + decay + 0.02)
  }
  const tone = (type, from, to, gain, decay) => {
    const o = ac.createOscillator()
    o.type = type
    o.frequency.setValueAtTime(from, t)
    o.frequency.exponentialRampToValueAtTime(to, t + decay)
    const g = ac.createGain()
    g.gain.setValueAtTime(gain, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + decay)
    o.connect(g).connect(master)
    o.start(t)
    o.stop(t + decay + 0.02)
  }

  if (kind === 'tennis') {
    // A felt ball off taut strings: a round "pock"
    burst('bandpass', 1100, 1.2, 0.7, 0.09)
    tone('sine', 280, 170, 0.35, 0.08)
  } else {
    // A hollow plastic ball off a solid face: higher and drier
    tone('sine', 1050, 720, 0.4, 0.05)
    burst('bandpass', 2600, 3, 0.35, 0.04)
  }
}
