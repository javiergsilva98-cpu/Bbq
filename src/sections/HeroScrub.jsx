import { useCallback, useRef } from 'react'
import gsap from 'gsap'
import ScrollScrubVideo from '../lib/ScrollScrubVideo.jsx'

const MAPS_URL = 'https://maps.app.goo.gl/mby1ioZjPMrW7xSG6'
const INSTAGRAM_URL = 'https://www.instagram.com/gonsastrez/'

// 0 below `from`, 1 above `to`, eased in between — for mapping scroll
// progress ranges onto opacity without hard cuts.
function fade(progress, from, to) {
  const t = Math.min(1, Math.max(0, (progress - from) / (to - from)))
  return t * t * (3 - 2 * t)
}

/**
 * The whole invitation happens over the pinned video:
 *   scene 1 (start)  — "BBQ en Canencia"
 *   scene 2 (middle) — the date, as the grill opens
 *   scene 3 (end)    — "Cómo llegar" + @gonsastrez, and it stays
 */
export default function HeroScrub() {
  const titleRef = useRef(null)
  const dateRef = useRef(null)
  const finaleRef = useRef(null)
  const cueRef = useRef(null)

  const handleProgress = useCallback((p) => {
    const titleOpacity = 1 - fade(p, 0.08, 0.24)
    const dateOpacity = fade(p, 0.3, 0.42) * (1 - fade(p, 0.58, 0.7))
    const finaleOpacity = fade(p, 0.78, 0.92)

    gsap.set(titleRef.current, {
      opacity: titleOpacity,
      y: -30 * fade(p, 0.08, 0.24),
    })
    gsap.set(dateRef.current, {
      opacity: dateOpacity,
      y: 24 * (1 - fade(p, 0.3, 0.42)),
    })
    gsap.set(finaleRef.current, {
      opacity: finaleOpacity,
      y: 24 * (1 - fade(p, 0.78, 0.92)),
      pointerEvents: finaleOpacity > 0.5 ? 'auto' : 'none',
    })
    gsap.set(cueRef.current, { opacity: (1 - fade(p, 0.02, 0.1)) * 0.7 })
  }, [])

  return (
    <ScrollScrubVideo
      sources={[
        { src: '/video/hero-bbq.webm', type: 'video/webm' },
        { src: '/video/hero-bbq.mp4', type: 'video/mp4' },
      ]}
      scrollLength="350%"
      onProgress={handleProgress}
    >
      <div ref={titleRef} className="hero__scene">
        <h1 className="hero__title">
          BBQ en <em>Canencia</em>
        </h1>
      </div>

      <div ref={dateRef} className="hero__scene hero__scene--hidden">
        <p className="hero__date-label">Guarda la fecha</p>
        <p className="hero__date">19.07.2026</p>
      </div>

      <div ref={finaleRef} className="hero__scene hero__scene--hidden">
        <a
          className="hero__cta"
          href={MAPS_URL}
          target="_blank"
          rel="noreferrer"
        >
          Cómo llegar
        </a>
        <a
          className="hero__signature"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
        >
          @gonsastrez
        </a>
      </div>

      <span ref={cueRef} className="hero__scrollcue">
        Scroll
      </span>
    </ScrollScrubVideo>
  )
}
