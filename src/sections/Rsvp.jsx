const WHATSAPP_NUMBER = '34600000000' // TODO: número real
const WHATSAPP_MESSAGE = 'Confirmo asistencia a la BBQ Cumple Glez 🔥'

export default function Rsvp() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <section className="section rsvp" id="rsvp">
      <p className="section__label">Confirmación</p>
      <h2 className="section__heading">¿Te apuntas?</h2>
      <a className="rsvp__button" href={href} target="_blank" rel="noreferrer">
        Confirmar por WhatsApp
      </a>
    </section>
  )
}
