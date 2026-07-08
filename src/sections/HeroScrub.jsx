import ScrollScrubVideo from '../lib/ScrollScrubVideo.jsx'

// Sections 1+2 of the concept: the video "arranca" on load (frame 0 = fuego
// encendiéndose) and scroll takes over from there — brasas, humo, carne.
export default function HeroScrub() {
  return (
    <ScrollScrubVideo
      sources={[
        { src: '/video/hero-bbq.webm', type: 'video/webm' },
        { src: '/video/hero-bbq.mp4', type: 'video/mp4' },
      ]}
      scrollLength="300%"
    >
      <p className="hero__eyebrow">Sierra Norte de Madrid · Canencia</p>
      <h1 className="hero__title">
        BBQ Cumple <em>Glez</em>
      </h1>
      <p className="hero__date">Fecha por confirmar · 2026</p>
      <span className="hero__scrollcue">Scroll</span>
    </ScrollScrubVideo>
  )
}
