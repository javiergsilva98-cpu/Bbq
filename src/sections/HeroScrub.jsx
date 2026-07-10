import { useCallback, useRef } from 'react'
import gsap from 'gsap'
import ScrollScrubVideo from '../lib/ScrollScrubVideo.jsx'

const MAPS_URL = 'https://maps.app.goo.gl/mby1ioZjPMrW7xSG6'
const BURGER_URL = 'https://bbq-canencia.lovable.app/'
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
 *   scene 2          — the date, as the grill opens
 *   scene 3          — pool reminder: bring a swimsuit
 *   scene 4 (end)    — burger/drink picker + "Cómo llegar" + @gonsastrez
 */
export default function HeroScrub() {
  const titleRef = useRef(null)
  const dateRef = useRef(null)
  const poolRef = useRef(null)
  const finaleRef = useRef(null)
  const cueRef = useRef(null)

  const handleProgress = useCallback((p) => {
    const titleOpacity = 1 - fade(p, 0.08, 0.2)
    const dateOpacity = fade(p, 0.24, 0.34) * (1 - fade(p, 0.44, 0.54))
    const poolOpacity = fade(p, 0.56, 0.66) * (1 - fade(p, 0.74, 0.82))
    const finaleOpacity = fade(p, 0.85, 0.95)

    gsap.set(titleRef.current, {
      opacity: titleOpacity,
      y: -30 * fade(p, 0.08, 0.2),
    })
    gsap.set(dateRef.current, {
      opacity: dateOpacity,
      y: 24 * (1 - fade(p, 0.24, 0.34)),
    })
    gsap.set(poolRef.current, {
      opacity: poolOpacity,
      y: 24 * (1 - fade(p, 0.56, 0.66)),
    })
    gsap.set(finaleRef.current, {
      opacity: finaleOpacity,
      y: 24 * (1 - fade(p, 0.85, 0.95)),
      pointerEvents: finaleOpacity > 0.5 ? 'auto' : 'none',
    })
    gsap.set(cueRef.current, { opacity: (1 - fade(p, 0.02, 0.1)) * 0.7 })
  }, [])

  return (
    <ScrollScrubVideo
      sources={[
        // mp4 first: it's the highest-bitrate encode and every modern
        // browser plays H.264 — webm is only a fallback.
        { src: '/video/hero-bbq.mp4', type: 'video/mp4' },
        { src: '/video/hero-bbq.webm', type: 'video/webm' },
      ]}
      poster="/video/hero-poster.jpg"
      scrollLength="450%"
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

      <div ref={poolRef} className="hero__scene hero__scene--hidden">
        <p className="hero__date-label">Hay piscina 💦</p>
        <p className="hero__pool">No te olvides del bañador</p>
      </div>

      <div ref={finaleRef} className="hero__scene hero__scene--hidden">
        <p className="hero__caption">Ayúdanos a que no falte ni una 🍺</p>
        <div className="hero__actions">
          <a
            className="hero__cta"
            href={BURGER_URL}
            target="_blank"
            rel="noreferrer"
          >
            Elegir mi burger y bebida
          </a>
          <a
            className="hero__cta hero__cta--ghost"
            href={MAPS_URL}
            target="_blank"
            rel="noreferrer"
          >
            Cómo llegar
          </a>
        </div>
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
