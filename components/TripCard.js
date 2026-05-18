import Link from 'next/link'

export default function TripCard({ trip }) {
  return (
    <Link href={`/viaje/${trip.id}`} style={{ textDecoration: 'none' }}>
      <div className="card-hover" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>

          {/* Ruta */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'stretch', gap: '16px' }}>
              {/* Línea de ruta */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--navy)', flexShrink: 0 }} />
                <div style={{ width: '1px', flex: 1, background: 'var(--border-md)', margin: '6px 0' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '2px solid var(--border-md)', background: 'var(--surface)', flexShrink: 0 }} />
              </div>

              {/* Ciudades */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--dark)', margin: 0, letterSpacing: '-0.01em' }}>{trip.origen}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '2px 0 0' }}>{trip.hora_salida} · {trip.punto_encuentro}</p>
                </div>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--dark)', margin: 0, letterSpacing: '-0.01em' }}>{trip.destino}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '2px 0 0' }}>Llegada estimada</p>
                </div>
              </div>
            </div>
          </div>

          {/* Precio y asientos */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ fontSize: '22px', fontWeight: 700, color: 'var(--dark)', margin: 0, letterSpacing: '-0.03em' }}>
              ${Number(trip.precio).toLocaleString('es-AR')}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '2px 0 0' }}>por persona</p>
            <p style={{ fontSize: '12px', color: 'var(--subtle)', margin: '6px 0 0' }}>
              {trip.asientos_disponibles} {trip.asientos_disponibles === 1 ? 'lugar disponible' : 'lugares disponibles'}
            </p>
          </div>
        </div>

        {/* Conductor */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--navy)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 600, flexShrink: 0
            }}>
              {trip.conductor_nombre?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--dark)', margin: 0 }}>{trip.conductor_nombre}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>★ {trip.conductor_rating}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span className="badge-trust">✓ Verificado</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
