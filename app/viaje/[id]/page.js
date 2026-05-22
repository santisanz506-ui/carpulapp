'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

export default function ViajeDetallePage() {
  const router = useRouter()
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [viaje, setViaje] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [paso, setPaso] = useState('pago')
  const [pagando, setPagando] = useState(false)
  const [yaReservo, setYaReservo] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      fetchViaje(user?.id)
    })
  }, [id])

  const fetchViaje = async (uid) => {
    const { data, error } = await supabase
      .from('viajes')
      .select('*, conductor:profiles!viajes_conductor_id_fkey(id, nombre, rating, foto_url, total_viajes), auto:autos(marca, modelo, anio, color, patente_fin, puertas, aire_acondicionado, permite_mascotas)')
      .eq('id', id)
      .single()

    if (error || !data) { setLoading(false); return }
    setViaje(data)

    if (uid) {
      const { data: reserva } = await supabase
        .from('reservas')
        .select('id')
        .eq('viaje_id', id)
        .eq('pasajero_id', uid)
        .neq('estado', 'rechazada')
        .maybeSingle()
      if (reserva) setYaReservo(true)
    }
    setLoading(false)
  }

  const handleReservar = () => {
    if (!user) { router.push('/auth/login'); return }
    if (viaje.conductor?.id === user.id) return
    setShowModal(true)
    setPaso('pago')
  }

  const handlePagar = async () => {
    setPagando(true)
    await new Promise(r => setTimeout(r, 1800))
    const { error } = await supabase.from('reservas').insert({
      viaje_id: viaje.id,
      pasajero_id: user.id,
      estado: 'pendiente',
    })
    if (!error) { setYaReservo(true); setPaso('exito') }
    setPagando(false)
  }

  const formatFecha = (f) => {
    if (!f) return ''
    const [y, m, d] = f.split('-')
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    return `${d} ${meses[parseInt(m) - 1]} ${y}`
  }

  if (loading) return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px', opacity: 0.4 }}>
      {[1,2,3].map(i => <div key={i} className="card" style={{ height: '80px', marginBottom: '12px' }} />)}
    </div>
  )

  if (!viaje) return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: '16px', color: 'var(--muted)' }}>Viaje no encontrado.</p>
      <Link href="/buscar" style={{ color: 'var(--navy)', fontSize: '14px' }}>&#8592; Volver a buscar</Link>
    </div>
  )

  const esConductor = viaje.conductor?.id === user?.id

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>
      <Link href="/buscar" style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '28px' }}>
        &#8592; Volver a buscar
      </Link>

      <div className="card" style={{ padding: '28px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--navy)' }} />
              <div style={{ width: '1px', flex: 1, background: 'var(--border-md)', margin: '8px 0' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid var(--border-md)', background: 'var(--surface)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--dark)', margin: 0 }}>{viaje.origen}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '3px 0 0' }}>
                  {viaje.hora_salida?.slice(0, 5)} · {formatFecha(viaje.fecha)}
                  {viaje.punto_encuentro ? ' · ' + viaje.punto_encuentro : ''}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--dark)', margin: 0 }}>{viaje.destino}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '3px 0 0' }}>Llegada estimada</p>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--dark)', margin: 0, letterSpacing: '-0.03em' }}>
              ${Number(viaje.precio).toLocaleString('es-AR')}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '3px 0 0' }}>por persona</p>
            <p style={{ fontSize: '12px', color: viaje.asientos_disponibles > 0 ? 'var(--trust)' : '#b91c1c', margin: '8px 0 0', fontWeight: 500 }}>
              {viaje.asientos_disponibles > 0
                ? viaje.asientos_disponibles + ' lugar' + (viaje.asientos_disponibles > 1 ? 'es' : '') + ' disponible' + (viaje.asientos_disponibles > 1 ? 's' : '')
                : 'Sin lugares disponibles'}
            </p>
          </div>
        </div>
        {viaje.descripcion && (
          <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '20px 0 0', paddingTop: '20px', borderTop: '1px solid var(--border)', lineHeight: 1.6 }}>
            {viaje.descripcion}
          </p>
        )}
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>Conductor</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, flexShrink: 0 }}>
            {viaje.conductor?.nombre?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 4px' }}>{viaje.conductor?.nombre}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {viaje.conductor?.rating && <span style={{ fontSize: '13px', color: 'var(--muted)' }}>&#9733; {viaje.conductor.rating}</span>}
              {viaje.conductor?.total_viajes > 0 && <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{viaje.conductor.total_viajes} viajes</span>}
              <span className="badge-trust">&#10003; Verificado</span>
            </div>
          </div>
        </div>
      </div>

      {viaje.auto && (
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>Vehículo</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(29,53,87,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>&#128663;</div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 4px' }}>
                {viaje.auto.marca} {viaje.auto.modelo} {viaje.auto.anio ? '(' + viaje.auto.anio + ')' : ''}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{viaje.auto.color}</span>
                <span style={{ fontSize: '12px', color: 'var(--subtle)' }}>·</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy)', letterSpacing: '0.06em' }}>···{viaje.auto.patente_fin}</span>
                {viaje.auto.aire_acondicionado && <span style={{ fontSize: '11px', background: 'rgba(46,139,87,0.1)', color: 'var(--trust)', padding: '2px 8px', borderRadius: '20px', fontWeight: 500 }}>&#10052; Aire</span>}
                {viaje.auto.permite_mascotas && <span style={{ fontSize: '11px', background: 'rgba(29,53,87,0.08)', color: 'var(--navy)', padding: '2px 8px', borderRadius: '20px', fontWeight: 500 }}>Mascotas</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {!esConductor && (
        yaReservo ? (
          <div style={{ background: 'rgba(46,139,87,0.07)', border: '1px solid rgba(46,139,87,0.2)', borderRadius: '12px', padding: '16px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--trust)', margin: '0 0 4px' }}>&#10003; Ya reservaste este viaje</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>Tu reserva está pendiente de confirmación del conductor.</p>
          </div>
        ) : viaje.asientos_disponibles > 0 ? (
          <button onClick={handleReservar} className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '12px', fontWeight: 600 }}>
            Reservar lugar — ${Number(viaje.precio).toLocaleString('es-AR')}
          </button>
        ) : (
          <button disabled className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '12px', opacity: 0.4, cursor: 'not-allowed' }}>
            Sin lugares disponibles
          </button>
        )
      )}

      {showModal && (
        <div onClick={(e) => { if (e.target === e.currentTarget && !pagando) setShowModal(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: 'var(--surface)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '480px', padding: '32px 28px 40px', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>
            {paso === 'pago' ? (
              <>
                <div style={{ width: '36px', height: '4px', background: 'var(--border-md)', borderRadius: '2px', margin: '0 auto 28px' }} />
                <p style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 24px' }}>Confirmá tu reserva</p>
                <div style={{ background: 'rgba(29,53,87,0.04)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Ruta</span>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--dark)' }}>{viaje.origen} → {viaje.destino}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Fecha</span>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--dark)' }}>{formatFecha(viaje.fecha)} · {viaje.hora_salida?.slice(0,5)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Conductor</span>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--dark)' }}>{viaje.conductor?.nombre}</span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--dark)' }}>Total</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--dark)' }}>${Number(viaje.precio).toLocaleString('es-AR')}</span>
                  </div>
                </div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Método de pago</p>
                <div style={{ border: '2px solid var(--navy)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', background: 'rgba(29,53,87,0.03)' }}>
                  <div style={{ width: '32px', height: '32px', background: '#009ee3', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>&#128179;</div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)', margin: 0 }}>Mercado Pago</p>
                    <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>Tarjeta, transferencia o saldo</p>
                  </div>
                  <div style={{ marginLeft: 'auto', width: '18px', height: '18px', borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />
                  </div>
                </div>
                <button onClick={handlePagar} disabled={pagando} className="btn-primary"
                  style={{ width: '100%', padding: '15px', fontSize: '15px', borderRadius: '12px', fontWeight: 600, opacity: pagando ? 0.7 : 1 }}>
                  {pagando ? 'Procesando...' : 'Pagar $' + Number(viaje.precio).toLocaleString('es-AR')}
                </button>
                <p style={{ fontSize: '12px', color: 'var(--subtle)', textAlign: 'center', margin: '12px 0 0' }}>
                  La reserva queda pendiente hasta que el conductor confirme.
                </p>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(46,139,87,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px' }}>&#10003;</div>
                <p style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px' }}>¡Reserva enviada!</p>
                <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 28px', lineHeight: 1.6 }}>
                  El conductor tiene que aceptar tu reserva.<br />Te avisamos cuando lo haga.
                </p>
                <button onClick={() => { setShowModal(false); router.push('/mis-viajes') }}
                  className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: '12px' }}>
                  Ver mis viajes
                </button>
                <button onClick={() => setShowModal(false)}
                  className="btn-ghost" style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: '12px', marginTop: '8px' }}>
                  Volver al viaje
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
