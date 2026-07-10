import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis } from './useSmoothScroll.js'

gsap.registerPlugin(ScrollTrigger)

/**
 * Pins its content for `scrollLength` of scroll distance and scrubs the
 * video's currentTime to scroll progress (0..duration) instead of
 * letting it play on its own — the Apple-style "scroll drives time" effect.
 */
export default function ScrollScrubVideo({
  sources,
  poster,
  scrollLength = '300%',
  className = '',
  onProgress,
  snapPoints,
  children,
}) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const onProgressRef = useRef(onProgress)
  onProgressRef.current = onProgress
  const snapPointsRef = useRef(snapPoints)
  snapPointsRef.current = snapPoints

  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) return

    let scrollTrigger
    let snapTimer
    let touchActive = false
    const onTouchStart = () => {
      touchActive = true
    }
    const onTouchEnd = () => {
      touchActive = false
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })

    const createScrollTrigger = () => {
      const duration = video.duration
      if (!duration || !isFinite(duration)) return

      // Gently magnetize the scroll toward the nearest text scene once
      // the user lets go. Animated through Lenis itself — ScrollTrigger's
      // built-in snap writes scroll positions directly and fights Lenis.
      const snapToNearest = () => {
        const st = scrollTrigger
        const points = snapPointsRef.current
        if (!st || !points?.length) return
        // Finger still on screen (slow deliberate drag) — never fight it.
        if (touchActive) {
          clearTimeout(snapTimer)
          snapTimer = setTimeout(snapToNearest, 100)
          return
        }
        const p = st.progress
        if (p <= 0.001 || p >= 0.999) return
        const nearest = points.reduce((a, b) =>
          Math.abs(b - p) < Math.abs(a - p) ? b : a,
        )
        const targetY = st.start + nearest * (st.end - st.start)
        const dist = Math.abs(window.scrollY - targetY)
        if (dist < 2) return
        const lenis = getLenis()
        if (lenis) {
          lenis.scrollTo(targetY, {
            // Longer, gentler glide — the 60fps video absorbs the slower
            // motion without stepping, so the magnet can feel unhurried.
            duration: Math.min(1.1, Math.max(0.55, dist / 1400)),
            // easeInOutCubic: soft departure and soft arrival, no snap.
            easing: (t) =>
              t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
          })
        } else {
          window.scrollTo({ top: targetY, behavior: 'smooth' })
        }
      }

      // Stillness detection by actual position, not velocity: iOS native
      // momentum ends with a ~1px/frame crawl whose every tick would keep
      // resetting a naive "did scroll stop?" timer, delaying the magnet by
      // up to a second. Sub-3px ticks don't count as movement, so the snap
      // takes over the moment the glide stops being perceptible.
      let lastSnapY = -1

      scrollTrigger = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: `+=${scrollLength}`,
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
        onUpdate: (self) => {
          const time = self.progress * duration
          if (!Number.isNaN(time)) {
            video.currentTime = time
          }
          onProgressRef.current?.(self.progress)
          const y = window.scrollY
          if (Math.abs(y - lastSnapY) > 3) {
            lastSnapY = y
            clearTimeout(snapTimer)
            snapTimer = setTimeout(snapToNearest, 70)
          }
        },
      })
    }

    // iOS/Android Safari won't let JS scrub currentTime reliably until the
    // video has actually started decoding once — a muted play()+immediate
    // pause() "primes" it. Without this, mobile browsers just show the
    // first/last frame and skip everything in between.
    const primeForScrubbing = async () => {
      try {
        await video.play()
        video.pause()
      } catch {
        // Autoplay blocked — scrubbing may still kick in once the user
        // interacts with the page (scroll counts as a gesture on most).
      }
    }

    const handleLoadedMetadata = () => {
      // Some mp4 encodes report duration: Infinity until forced to seek once.
      if (!isFinite(video.duration)) {
        const forceDurationFix = () => {
          video.removeEventListener('timeupdate', forceDurationFix)
          video.currentTime = 0
          primeForScrubbing().then(createScrollTrigger)
        }
        video.addEventListener('timeupdate', forceDurationFix)
        video.currentTime = 1e10
      } else {
        primeForScrubbing().then(createScrollTrigger)
      }
    }

    video.pause()

    if (video.readyState >= 1) {
      handleLoadedMetadata()
    } else {
      video.addEventListener('loadedmetadata', handleLoadedMetadata)
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
      clearTimeout(snapTimer)
      scrollTrigger?.kill()
    }
  }, [sources, scrollLength, snapPoints])

  return (
    <section ref={containerRef} className={`scroll-scrub ${className}`}>
      <div className="scroll-scrub__stage">
        <video
          ref={videoRef}
          className="scroll-scrub__video"
          muted
          playsInline
          webkit-playsinline="true"
          preload="auto"
          poster={poster}
        >
          {sources.map((source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ))}
        </video>
        {children && <div className="scroll-scrub__overlay">{children}</div>}
      </div>
    </section>
  )
}
