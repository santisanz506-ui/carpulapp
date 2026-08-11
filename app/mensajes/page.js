'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { Suspense } from 'react'

function MensajesContenido() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reservaIdParam = searchParams.get('reserva')

  const [user, setUser] = useState(null)
  const [reservas, setReservas] = useState([])
  const [reservaActiva, setReservaActiva] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [respondiendo, setRespondiendo] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/auth/login')
      else { setUser(user); fetchConversaciones(user.id) }
    })
  }, [])

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const fetchConversaciones = async (uid, mantenerActiva = false) => {
    // Traer todas las reservas (pendientes o aceptadas) donde el user es conductor o pasajero.
    // El chat se abre apenas se envía la solicitud, no hace falta esperar a que se acepte.
    const [{ data: comoConductor }, { data: comoPasajero }] = await Promise.all([
      supabase
        .from('reservas')
        .select(`
          *,
          viaje:viajes!inner(origen, destino, fecha, hora_salida, conductor_id),
          pasajero:profiles!reservas_pasajero_id_fkey(id, nombre, foto_url)
        `)
        .eq('viaje.conductor_id', uid)
        .in('estado', ['pendiente', 'aceptada', 'rechazada']),
      supabase
        .from('reservas')
        .select(`
          *,
          viaje:viajes(origen, destino, fecha, hora_salida, conductor_id, conductor:profiles!viajes_conductor_id_fkey(id, nombre, foto_url)),
          pasajero:profiles!reservas_pasajero_id_fkey(id, nombre, foto_url)
        `)
        .eq('pasajero_id', uid)
        .in('estado', ['pendiente', 'aceptada', 'rechazada'])
    ])

    const filas = [
      ...(comoConductor || []).map(r => ({ ...r, _esConductor: true })),
      ...(comoPasajero || []).map(r => ({ ...r, _esConductor: false })),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    setReservas(filas)
    setLoading(false)

    if (reservaIdParam && filas.length) {
      const r = filas.find(r => r.id === reservaIdParam)
      if (r) seleccionarReserva(r, uid)
    } else if (mantenerActiva) {
      setReservaActiva(prev => {
        if (!prev) return prev
        const actualizada = filas.find(r => r.id === prev.id)
        return actualizada || prev
      })
    } else if (filas.length > 0) {
      seleccionarReserva(filas[0], uid)
    }
  }

  const seleccionarReserva = async (reserva, uid) => {
    setReservaActiva(reserva)
    fetchMensajes(reserva.id)

    // Suscribirse a mensajes en tiempo real
    supabase.channel(`mensajes-${reserva.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'mensajes',
        filter: `reserva_id=eq.${reserva.id}`
      }, payload => {
        setMensajes(prev => [...prev, payload.new])
      })
      .subscribe()
  }

  const fetchMensajes = async (reservaId) => {
    const { data } = await supabase
      .from('mensajes')
      .select('*')
      .eq('reserva_id', reservaId)
      .order('created_at', { ascending: true })
    setMensajes(data || [])
  }

  const enviarMensaje = async (e) => {
    e.preventDefault()
    if (!texto.trim() || !reservaActiva || enviando) return
    setEnviando(true)

    const { error } = await supabase.from('mensajes').insert({
      reserva_id: reservaActiva.id,
      sender_id: user.id,
      texto: texto.trim(),
    })

    if (!error) setTexto('')
    setEnviando(false)
  }

  const responderReserva = async (nuevoEstado) => {
    if (!reservaActiva || respondiendo) return
    setRespondiendo(true)
    const { error } = await supabase
      .from('reservas')
      .update({ estado: nuevoEstado })
      .eq('id', reservaActiva.id)

    if (error) {
      alert(`Error: ${error.message}`)
    } else {
      if (nuevoEstado === 'aceptada') {
        await supabase.rpc('decrementar_asientos', { viaje_id_param: reservaActiva.viaje_id, asientos_param: reservaActiva.asientos || 1 })
      }
      await supabase.from('mensajes').insert({
        reserva_id: reservaActiva.id,
        sender_id: user.id,
        texto: nuevoEstado === 'aceptada' ? 'Solicitud aceptada ✓' : 'Solicitud rechazada',
      })
      fetchConversaciones(user.id, true)
    }
    setRespondiendo(false)
  }

  const formatHora = (ts) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatFecha = (ts) => {
    const d = new Date(ts)
    const hoy = new Date()
    const ayer = new Date(hoy); ayer.setDate(ayer.getDate() - 1)
    if (d.toDateString() === hoy.toDateString()) return 'Hoy'
    if (d.toDateString() === ayer.toDateString()) return 'Ayer'
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
  }

  const estadoBadge = (estado) => {
    const estilos = {
      pendiente: { bg: 'rgba(234,179,8,0.12)', color: '#854d0e', label: 'Pendiente' },
      aceptada:  { bg: 'rgba(46,139,87,0.1)',  color: 'var(--trust)', label: 'Aceptada' },
      rechazada: { bg: 'rgba(220,38,38,0.08)', color: '#b91c1c', label: 'Rechazada' },
    }
    const e = estilos[estado] || estilos.pendiente
    return (
      <span style={{ fontSize: '10.5px', fontWeight: 600, background: e.bg, color: e.color, padding: '2px 8px', borderRadius: '20px', flexShrink: 0 }}>
        {e.label}
      </span>
    )
  }

  if (loading) return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px', opacity: 0.4 }}>
      <div style={{ height: '60px', background: 'var(--border)', borderRadius: '12px' }} />
    </div>
  )

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 24px' }}>Mensajes</h1>

      {reservas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontSize: '36px', marginBottom: '16px' }}>💬</p>
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 8px' }}>
            Todavía no tenés conversaciones activas
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 28px' }}>
            El chat se abre apenas enviás o recibís una solicitud de reserva.
          </p>
          <Link href="/buscar" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            Buscar viajes
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', height: '600px' }}>
          {/* Lista de conversaciones */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', margin: 0 }}>CONVERSACIONES</p>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {reservas.map(r => {
                const otroNombre = r._esConductor
                  ? r.pasajero?.nombre || 'Pasajero'
                  : r.viaje?.conductor?.nombre || 'Conductor'
                const activa = reservaActiva?.id === r.id
                return (
                  <button key={r.id} onClick={() => seleccionarReserva(r, user.id)}
                    style={{
                      width: '100%', padding: '14px 20px', textAlign: 'left', border: 'none', cursor: 'pointer',
                      background: activa ? 'rgba(29,53,87,0.06)' : 'transparent',
                      borderBottom: '1px solid var(--border)',
                      borderLeft: activa ? '3px solid var(--navy)' : '3px solid transparent',
                      transition: 'all 0.1s'
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)', margin: 0 }}>{otroNombre}</p>
                      {estadoBadge(r.estado)}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 2px' }}>
                      {r.viaje?.origen} → {r.viaje?.destino}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--subtle)', margin: 0 }}>
                      {r.viaje?.fecha} · {r.viaje?.hora_salida?.slice(0, 5)}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Chat */}
          {reservaActiva ? (
            <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Header del chat */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 2px' }}>
                      {reservaActiva.viaje?.origen} → {reservaActiva.viaje?.destino}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
                      {reservaActiva.viaje?.fecha} · {reservaActiva.viaje?.hora_salida?.slice(0, 5)} · {reservaActiva.asientos} asiento{reservaActiva.asientos !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {estadoBadge(reservaActiva.estado)}
                </div>

                {reservaActiva._esConductor && reservaActiva.estado === 'pendiente' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      onClick={() => responderReserva('rechazada')}
                      disabled={respondiendo}
                      style={{ flex: 1, padding: '8px 14px', fontSize: '13px', fontWeight: 600, borderRadius: '8px', border: '1px solid var(--border-md)', background: 'transparent', color: '#b91c1c', cursor: 'pointer', opacity: respondiendo ? 0.5 : 1 }}>
                      Rechazar
                    </button>
                    <button
                      onClick={() => responderReserva('aceptada')}
                      disabled={respondiendo}
                      className="btn-primary"
                      style={{ flex: 1, padding: '8px 14px', fontSize: '13px', fontWeight: 600, borderRadius: '8px', opacity: respondiendo ? 0.5 : 1 }}>
                      Aceptar solicitud
                    </button>
                  </div>
                )}
              </div>

              {/* Mensajes */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {mensajes.length === 0 && (
                  <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--muted)', fontSize: '14px' }}>
                    <p style={{ marginBottom: '6px' }}>💬</p>
                    <p>Comenzá la conversación</p>
                  </div>
                )}
                {mensajes.map((m, i) => {
                  const esMio = m.sender_id === user?.id
                  const anterior = i > 0 ? mensajes[i - 1] : null
                  const mismoRemitente = anterior?.sender_id === m.sender_id
                  const fechaAnterior = anterior ? formatFecha(anterior.created_at) : null
                  const fechaActual = formatFecha(m.created_at)
                  const mostrarFecha = fechaAnterior !== fechaActual

                  return (
                    <div key={m.id}>
                      {mostrarFecha && (
                        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--subtle)', margin: '8px 0', fontWeight: 500 }}>
                          {fechaActual}
                        </p>
                      )}
                      <div style={{ display: 'flex', justifyContent: esMio ? 'flex-end' : 'flex-start', marginTop: mismoRemitente ? '3px' : '10px' }}>
                        <div style={{
                          maxWidth: '70%', padding: '10px 14px',
                          borderRadius: esMio ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: esMio ? 'var(--navy)' : 'rgba(0,0,0,0.06)',
                          color: esMio ? '#fff' : 'var(--dark)',
                        }}>
                          <p style={{ fontSize: '14px', margin: '0 0 4px', lineHeight: 1.5 }}>{m.texto}</p>
                          <p style={{ fontSize: '10px', margin: 0, opacity: 0.6, textAlign: 'right' }}>{formatHora(m.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={enviarMensaje} style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', flexShrink: 0, background: 'var(--surface)' }}>
                <input
                  type="text"
                  value={texto}
                  onChange={e => setTexto(e.target.value)}
                  placeholder="Escribí un mensaje..."
                  className="input-field"
                  style={{ flex: 1 }}
                  autoComplete="off"
                />
                <button type="submit" disabled={!texto.trim() || enviando} className="btn-primary"
                  style={{ borderRadius: '10px', padding: '10px 18px', opacity: (!texto.trim() || enviando) ? 0.5 : 1 }}>
                  Enviar
                </button>
              </form>
            </div>
          ) : (
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Seleccioná una conversación</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function MensajesPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Cargando mensajes...</div>}>
      <MensajesContenido />
    </Suspense>
  )
}
