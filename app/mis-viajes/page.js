'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function MisViajesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('conductor')
  const [viajesComoCondutor, setViajesComoConductor] = useState([])
  const [viajesComoPasajero, setViajesComoPasajero] = useState([])
  const [loading, setLoading] = useState(true)
  const [accionando, setAccionando] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/auth/login')
      else {
        setUser(user)
        fetchTodo(user.id)

        // Escuchar cambios en reservas en tiempo real
        const channel = supabase
          .channel('reservas-cambios')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'reservas' }, () => {
            fetchTodo(user.id)
          })
          .subscribe()

        return () => supabase.removeChannel(channel)
      }
    })
  }, [])

  const fetchTodo = async (uid, showLoading = true) => {
    if (showLoading) setLoading(true)

    const [{ data: viajes }, { data: reservasPasajero }] = await Promise.all([
      supabase
        .from('viajes')
        .select('*, reservas(id, estado, asientos, pasajero:profiles!reservas_pasajero_id_fkey(nombre, rating))')
        .eq('conductor_id', uid)
        .order('fecha', { ascending: false }),
      supabase
        .from('reservas')
        .select('*, viaje:viajes(origen, destino, fecha, hora_salida, precio, conductor:profiles!viajes_conductor_id_fkey(nombre, rating))')
        .eq('pasajero_id', uid)
        .order('created_at', { ascending: false })
    ])

    setViajesComoConductor(viajes || [])
    setViajesComoPasajero(reservasPasajero || [])
    setLoading(false)
  }

  const responderReserva = async (reservaId, nuevoEstado, uid, viajeId, asientosReserva) => {
    setAccionando(reservaId)
    const { error } = await supabase
      .from('reservas')
      .update({ estado: nuevoEstado })
      .eq('id', reservaId)
    if (error) {
      alert(`Error: ${error.message}`)
    } else {
      // Si acepta, decrementar la cantidad de asientos que pidió esta reserva (no siempre 1)
      if (nuevoEstado === 'aceptada') {
        await supabase.rpc('decrementar_asientos', { viaje_id_param: viajeId, asientos_param: asientosReserva || 1 })
      }
      fetchTodo(uid, false)
    }
    setAccionando(null)
  }

  const formatFecha = (f) => {
    if (!f) return ''
    const [y, m, d] = f.split('-')
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    return `${d} ${meses[parseInt(m)-1]}`
  }

  const estadoBadge = (estado) => {
    const estilos = {
      pendiente:  { bg: 'rgba(234,179,8,0.1)',  color: '#854d0e', label: 'Pendiente' },
      aceptada:   { bg: 'rgba(46,139,87,0.1)',  color: 'var(--trust)', label: 'Aceptada' },
      rechazada:  { bg: 'rgba(220,38,38,0.08)', color: '#b91c1c', label: 'Rechazada' },
    }
    const e = estilos[estado] || estilos.pendiente
    return (
      <span style={{ fontSize: '11px', fontWeight: 600, background: e.bg, color: e.color, padding: '3px 10px', borderRadius: '20px' }}>
        {e.label}
      </span>
    )
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Mi cuenta</p>
        <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>Mis viajes</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '28px' }}>
        {[{ key: 'conductor', label: 'Como conductor' }, { key: 'pasajero', label: 'Como pasajero' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex: 1, padding: '10px', fontSize: '14px', fontWeight: 600, borderRadius: '9px', border: 'none', cursor: 'pointer',
              background: tab === t.key ? 'var(--surface)' : 'transparent',
              color: tab === t.key ? 'var(--dark)' : 'var(--muted)',
              boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ opacity: 0.4 }}>
          {[1,2].map(i => <div key={i} className="card" style={{ height: '100px', marginBottom: '12px' }} />)}
        </div>
      ) : tab === 'conductor' ? (
        viajesComoCondutor.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '36px', marginBottom: '12px' }}>🚗</p>
            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 6px' }}>Todavía no publicaste viajes</p>
            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 24px' }}>Publicá tu primer viaje y empezá a sumar pasajeros.</p>
            <Link href="/publicar" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>Publicar un viaje</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {viajesComoCondutor.map(viaje => {
              const pendientes = viaje.reservas?.filter(r => r.estado === 'pendiente') || []
              const aceptadas = viaje.reservas?.filter(r => r.estado === 'aceptada') || []
              return (
                <div key={viaje.id} className="card" style={{ padding: '22px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: pendientes.length > 0 ? '16px' : '0' }}>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--dark)', margin: '0 0 4px' }}>
                        {viaje.origen} → {viaje.destino}
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                        {formatFecha(viaje.fecha)} · {viaje.hora_salida?.slice(0,5)} · ${Number(viaje.precio).toLocaleString('es-AR')} por persona
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--subtle)', margin: '4px 0 0' }}>
                        {aceptadas.length} pasajero{aceptadas.length !== 1 ? 's' : ''} confirmado{aceptadas.length !== 1 ? 's' : ''} · {viaje.asientos_disponibles} lugar{viaje.asientos_disponibles !== 1 ? 'es' : ''} libre{viaje.asientos_disponibles !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {pendientes.length > 0 && (
                      <span style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(234,179,8,0.15)', color: '#854d0e', padding: '4px 10px', borderRadius: '20px', flexShrink: 0 }}>
                        {pendientes.length} pendiente{pendientes.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {pendientes.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
                        Solicitudes pendientes
                      </p>
                      {pendientes.map(reserva => (
                        <div key={reserva.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                              {reserva.pasajero?.nombre?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--dark)', margin: 0 }}>{reserva.pasajero?.nombre}</p>
                              {reserva.pasajero?.rating && <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>★ {reserva.pasajero.rating}</p>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                            <Link href={`/mensajes?reserva=${reserva.id}`}
                              style={{ padding: '7px 12px', fontSize: '13px', fontWeight: 600, borderRadius: '8px', border: '1px solid var(--border-md)', background: 'transparent', color: 'var(--navy)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                              💬 Chat
                            </Link>
                            <button
                              onClick={() => responderReserva(reserva.id, 'rechazada', user.id, viaje.id, reserva.asientos)}
                              disabled={accionando === reserva.id}
                              style={{ padding: '7px 14px', fontSize: '13px', fontWeight: 600, borderRadius: '8px', border: '1px solid var(--border-md)', background: 'transparent', color: '#b91c1c', cursor: 'pointer', opacity: accionando === reserva.id ? 0.5 : 1 }}>
                              Rechazar
                            </button>
                            <button
                              onClick={() => responderReserva(reserva.id, 'aceptada', user.id, viaje.id, reserva.asientos)}
                              disabled={accionando === reserva.id}
                              className="btn-primary"
                              style={{ padding: '7px 14px', fontSize: '13px', fontWeight: 600, borderRadius: '8px', opacity: accionando === reserva.id ? 0.5 : 1 }}>
                              Aceptar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      ) : (
        viajesComoPasajero.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</p>
            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 6px' }}>Todavía no reservaste ningún viaje</p>
            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 24px' }}>Buscá un viaje y reservá tu lugar.</p>
            <Link href="/buscar" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>Buscar viajes</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {viajesComoPasajero.map(reserva => (
              <div key={reserva.id} className="card" style={{ padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--dark)', margin: '0 0 4px' }}>
                    {reserva.viaje?.origen} → {reserva.viaje?.destino}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 6px' }}>
                    {formatFecha(reserva.viaje?.fecha)} · {reserva.viaje?.hora_salida?.slice(0,5)} · con {reserva.viaje?.conductor?.nombre}
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)', margin: 0 }}>
                    ${Number(reserva.viaje?.precio).toLocaleString('es-AR')}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                  {estadoBadge(reserva.estado)}
                  {reserva.estado !== 'rechazada' && (
                    <Link href={`/mensajes?reserva=${reserva.id}`}
                      style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--navy)', textDecoration: 'none' }}>
                      💬 Chatear
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <Link href="/publicar" style={{ fontSize: '14px', color: 'var(--navy)', textDecoration: 'none', fontWeight: 500 }}>
          → Publicar un viaje
        </Link>
      </div>
    </div>
  )
}
