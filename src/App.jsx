import { useSmoothScroll } from './lib/useSmoothScroll.js'
import HeroScrub from './sections/HeroScrub.jsx'
import Details from './sections/Details.jsx'
import Rsvp from './sections/Rsvp.jsx'
import Outro from './sections/Outro.jsx'
import './styles/App.css'

export default function App() {
  useSmoothScroll()

  return (
    <main className="app">
      <HeroScrub />
      <Details />
      <Rsvp />
      <Outro />
    </main>
  )
}
