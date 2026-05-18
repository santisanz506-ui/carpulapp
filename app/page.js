import SearchForm from '../components/SearchForm'
import Link from 'next/link'

const RUTAS_POPULARES = [
  { desde: 'Buenos Aires', hasta: 'Córdoba', tiempo: '7–8 hs' },
  { desde: 'Buenos Aires', hasta: 'Rosario', tiempo: '3–4 hs' },
  { desde: 'Buenos Aires', hasta: 'Mar del Plata', tiempo: '4–5 hs' },
  { desde: 'Córdoba', hasta: 'Mendoza', tiempo: '8–9 hs' },
]

const TRUST_PILLARS = [
  {
    label: 'Identidad verificada',
    desc: 'Cada conductor y pasajero pasa por verificación de DNI antes de viajar.',
    icon: '◈',
  },
  {
    label: 'Calificaciones reales',
    desc: 'Después de cada viaje, conductor y pasajero se califican mutuamente.',
    icon: '◎',
  },
  {
    label: 'Pago protegido',
    desc: 'El dinero queda retenido hasta que el viaje se completa correctamente.',
    icon: '◉',
  },
  {
    label: 'Soporte 24/7',
    desc: 'Equipo disponible ante cualquier inconveniente antes, durante y después del viaje.',
    icon: '◇',
  },
]

const COMO_FUNCIONA = [
  { num: '01', title: 'Buscá tu ruta', desc: 'Ingresá origen, destino y fecha. Te mostramos conductores verificados disponibles.' },
  { num: '02', title: 'Elegí con confianza', desc: 'Revisá el perfil, historial de viajes y calificaciones del conductor antes de reservar.' },
  { num: '03', title: 'Reservá y pagá seguro', desc: 'El pago queda protegido hasta que el viaje se complete. Sin efectivo, sin riesgos.' },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: '#111111', color: '#FFFFFF', padding: '80px 24px 96px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ maxWidth: '640px', marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '5px 14px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2E8B57', display: 'inline-block' }} />
              Plataforma verificada
            </div>
            <h1 style={{ fontSize: 'clamp(36px, 6vw, 58px)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.08, color: '#FFFFFF', margin: '0 0 20px' }}>
              La forma más inteligente de viajar entre ciudades.
            </h1>
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: 0, maxWidth: '480px' }}>
              Conectamos viajeros verificados en rutas de confianza. Sin efectivo, sin sorpresas, con total transparencia.
            </p>
          </div>

          <SearchForm />

          {/* Stats */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', marginTop: '40px' }}>
            {[
              { val: '+12.000', label: 'viajeros verificados' },
              { val: '4.8 ★', label: 'calificación promedio' },
              { val: '+40', label: 'rutas activas' },
            ].map(s => (
              <div key={s.val}>
                <p style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', margin: 0, letterSpacing: '-0.03em' }}>{s.val}</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rutas populares */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '28px' }}>
          <h2 className="section-title">Rutas populares</h2>
          <Link href="/buscar" style={{ fontSize: '13px', color: 'var(--navy)', fontWeight: 500, textDecoration: 'none' }}>Ver todas →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {RUTAS_POPULARES.map(r => (
            <a key={r.desde + r.hasta} href={`/buscar?origen=${r.desde}&destino=${r.hasta}`}
              className="card-hover" style={{ padding: '20px 24px', textDecoration: 'none', display: 'block' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)', margin: 0 }}>{r.desde}</p>
              <p style={{ fontSize: '12px', color: 'var(--subtle)', margin: '4px 0 12px' }}>{r.tiempo}</p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)', margin: 0 }}>{r.hasta}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Confianza */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px 0' }}>
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Por qué elegirnos</p>
          <h2 className="section-title" style={{ maxWidth: '440px' }}>Diseñado para generar confianza en cada viaje.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
          {TRUST_PILLARS.map(p => (
            <div key={p.label} className="card" style={{ padding: '28px 24px' }}>
              <p style={{ fontSize: '22px', color: 'var(--navy)', margin: '0 0 16px', lineHeight: 1 }}>{p.icon}</p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 8px', letterSpacing: '-0.01em' }}>{p.label}</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0, lineHeight: 1.65 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px 0' }}>
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>El proceso</p>
          <h2 className="section-title">Simple. Transparente. Seguro.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {COMO_FUNCIONA.map(s => (
            <div key={s.num} className="card" style={{ padding: '28px 24px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--subtle)', letterSpacing: '0.06em', margin: '0 0 16px' }}>{s.num}</p>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 8px', letterSpacing: '-0.01em' }}>{s.title}</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0, lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: '1100px', margin: '80px auto 0', padding: '0 24px' }}>
        <div style={{ background: 'var(--navy)', borderRadius: '20px', padding: '56px 48px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 8px', letterSpacing: '-0.03em' }}>¿Tenés auto y viajás seguido?</h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>Publicá tu próximo viaje y compartí los gastos.</p>
          </div>
          <Link href="/publicar" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#FFFFFF', color: 'var(--navy)',
            padding: '14px 28px', borderRadius: '12px',
            fontWeight: 600, fontSize: '14px', textDecoration: 'none',
            letterSpacing: '-0.01em', whiteSpace: 'nowrap'
          }}>
            Publicar un viaje →
          </Link>
        </div>
      </section>
    </div>
  )
}
