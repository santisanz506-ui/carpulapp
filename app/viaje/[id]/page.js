import Link from 'next/link'

const VIAJE = {
  id: '1', origen: 'Buenos Aires', destino: 'Córdoba',
  fecha: '1 de junio de 2025', hora_salida: '07:00', hora_llegada: '13:30 (aprox.)',
  precio: 12000, asientos_disponibles: 3,
  conductor_nombre: 'Martín G.', conductor_rating: 4.8, conductor_viajes: 47,
  punto_encuentro: 'Estación Retiro, puerta principal',
  descripcion: 'Viaje directo, sin escalas. Parada en Rosario para cargar nafta (20 min). Auto amplio con aire acondicionado.',
}

export default function ViajeDetallePage() {
  return (
    <div style={{ maxWidth: '740px', margin: '0 auto', padding: '40px 24px' }}>
      <Link href="/buscar" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--muted)', textDecoration: 'none', marginBottom: '28px', fontWeight: 500 }}>
        ← Volver a resultados
      </Link>

      {/* Ruta principal */}
      <div className="card" style={{ padding: '32px', marginBottom: '12px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 24px' }}>{VIAJE.fecha}</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            {/* Línea */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '5px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--navy)' }} />
              <div style={{ width: '1px', height: '52px', background: 'var(--border-md)', margin: '8px 0' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid var(--border-md)', background: 'var(--surface)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <p style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--dark)', margin: 0 }}>{VIAJE.hora_salida}</p>
                <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '4px 0 0' }}>{VIAJE.origen}</p>
              </div>
              <div>
                <p style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--dark)', margin: 0 }}>{VIAJE.hora_llegada}</p>
                <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '4px 0 0' }}>{VIAJE.destino}</p>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--dark)', margin: 0 }}>
              ${Number(VIAJE.precio).toLocaleString('es-AR')}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 0' }}>por persona</p>
            <p style={{ fontSize: '13px', color: 'var(--subtle)', margin: '8px 0 0' }}>
              {VIAJE.asientos_disponibles} lugares disponibles
            </p>
          </div>
        </div>

        <hr className="divider" style={{ margin: '24px 0' }} />

        {/* Punto de encuentro */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(29,53,87,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '16px' }}>
            📍
          </div>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Punto de encuentro</p>
            <p style={{ fontSize: '14px', color: 'var(--dark)', margin: 0, fontWeight: 500 }}>{VIAJE.punto_encuentro}</p>
          </div>
        </div>

        {VIAJE.descripcion && (
          <>
            <hr className="divider" style={{ margin: '20px 0' }} />
            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{VIAJE.descripcion}</p>
          </>
        )}
      </div>

      {/* Conductor */}
      <div className="card" style={{ padding: '28px 32px', marginBottom: '12px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 20px' }}>Tu conductor</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, flexShrink: 0 }}>
            {VIAJE.conductor_nombre[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--dark)', margin: 0, letterSpacing: '-0.01em' }}>{VIAJE.conductor_nombre}</p>
              <span className="badge-trust">✓ Verificado</span>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>★ {VIAJE.conductor_rating} de calificación</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>{VIAJE.conductor_viajes} viajes realizados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reservar */}
      <div className="card" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '14px 16px', background: 'rgba(46,139,87,0.06)', borderRadius: '10px', border: '1px solid rgba(46,139,87,0.15)' }}>
          <span style={{ fontSize: '16px' }}>🔒</span>
          <p style={{ fontSize: '13px', color: '#1a6640', margin: 0, fontWeight: 500 }}>Pago protegido — el dinero se libera al conductor cuando llegás a destino.</p>
        </div>
        <Link href="/auth/login" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--navy)', color: '#fff',
          padding: '16px 24px', borderRadius: '12px',
          fontWeight: 600, fontSize: '15px', textDecoration: 'none',
          letterSpacing: '-0.01em', gap: '8px'
        }}>
          Reservar asiento · ${Number(VIAJE.precio).toLocaleString('es-AR')}
        </Link>
        <p style={{ fontSize: '12px', color: 'var(--subtle)', textAlign: 'center', margin: '12px 0 0' }}>
          No se realiza ningún cargo hasta que el conductor confirme.
        </p>
      </div>
    </div>
  )
}
