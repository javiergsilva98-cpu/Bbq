import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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
  children,
}) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const onProgressRef = useRef(onProgress)
  onProgressRef.current = onProgress

  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) return

    let scrollTrigger

    const createScrollTrigger = () => {
      const duration = video.duration
      if (!duration || !isFinite(duration)) return

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
      scrollTrigger?.kill()
    }
  }, [sources, scrollLength])

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
