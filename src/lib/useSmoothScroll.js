import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// The address bar hiding/showing on mobile fires resize events that would
// otherwise make ScrollTrigger recalculate pin distances mid-scroll,
// causing the pinned hero to jump. This tells it to ignore those.
ScrollTrigger.config({ ignoreMobileResize: true })

// The live Lenis instance, so other modules (e.g. scroll snapping) can
// animate the scroll through Lenis instead of fighting it.
let activeLenis = null
export function getLenis() {
  return activeLenis
}

/**
 * Wires Lenis smooth scroll into GSAP's ticker/ScrollTrigger so pinned,
 * scrubbed animations stay in sync with the (smoothed) scroll position
 * instead of the raw native scroll event.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      syncTouch: false,
    })
    activeLenis = lenis

    lenis.on('scroll', ScrollTrigger.update)

    const tickerCallback = (time) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tickerCallback)
      lenis.destroy()
      activeLenis = null
    }
  }, [])
}
