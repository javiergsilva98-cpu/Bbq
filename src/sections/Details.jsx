export default function Details() {
  return (
    <section className="section section--alt" id="detalles">
      <p className="section__label">Detalles</p>
      <h2 className="section__heading">Lo esencial para el día</h2>
      <div className="details__grid">
        <div className="details__card">
          <h3>Fecha y hora</h3>
          <p>Por confirmar</p>
        </div>
        <div className="details__card">
          <h3>Ubicación</h3>
          <p>Canencia, Sierra Norte de Madrid</p>
        </div>
        <div className="details__card">
          <h3>Qué llevar</h3>
          <p>Por confirmar</p>
        </div>
        <div className="details__card">
          <h3>Qué hay</h3>
          <p>Por confirmar</p>
        </div>
      </div>
    </section>
  )
}
