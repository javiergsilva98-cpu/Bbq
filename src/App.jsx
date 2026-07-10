import { useSmoothScroll } from './lib/useSmoothScroll.js'
import HeroScrub from './sections/HeroScrub.jsx'
import './styles/App.css'

export default function App() {
  useSmoothScroll()

  return (
    <main className="app">
      <HeroScrub />
    </main>
  )
}
