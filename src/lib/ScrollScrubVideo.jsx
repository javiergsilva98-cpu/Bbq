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
        const lenis = getLenis()
        // Only defer while the glide is still clearly moving — the snap
        // takes over the tail end of the inertia so glide and magnet read
        // as one continuous motion instead of stop-wait-snap.
        if (lenis && Math.abs(lenis.velocity) > 1.5) {
          clearTimeout(snapTimer)
          snapTimer = setTimeout(snapToNearest, 50)
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
        if (lenis) {
          lenis.scrollTo(targetY, {
            // Fast enough that the 24fps video reads as motion, not steps.
            duration: Math.min(0.5, Math.max(0.25, dist / 2500)),
            easing: (t) => 1 - Math.pow(1 - t, 3),
          })
        } else {
          window.scrollTo({ top: targetY, behavior: 'smooth' })
        }
      }

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
          clearTimeout(snapTimer)
          snapTimer = setTimeout(snapToNearest, 70)
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
