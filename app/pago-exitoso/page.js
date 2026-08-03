'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

function PagoExitosoContenido() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [estado, setEstado] = useState('procesando')

  const viajeId = searchParams.get('viaje_id')
  const pasajeroId = searchParams.get('pasajero_id')
  const asientos = parseInt(searchParams.get('asientos') || '1')
  const status = searchParams.get('status')

  useEffect(() => {
    if (!viajeId || !pasajeroId) { router.push('/'); return }
    crearReserva()
  }, [])

  const crearReserva = async () => {
    // Verificar si ya existe una reserva para no duplicar
    const { data: existente } = await supabase
      .from('reservas')
      .select('id')
      .eq('viaje_id', viajeId)
      .eq('pasajero_id', pasajeroId)
      .neq('estado', 'rechazada')
      .maybeSingle()

    if (existente) { setEstado('exito'); return }

    const { error } = await supabase.from('reservas').insert({
      viaje_id: viajeId,
      pasajero_id: pasajeroId,
      estado: status === 'pending' ? 'pendiente' : 'pendiente',
      asientos,
    })

    setEstado(error ? 'error' : 'exito')
  }

  if (estado === 'procesando') return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '16px', color: 'var(--muted)' }}>Confirmando tu reserva...</p>
    </div>
  )

  if (estado === 'error') return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '36px', marginBottom: '16px' }}>⚠️</p>
        <p style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px' }}>Hubo un problema</p>
        <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 24px' }}>El pago se procesó pero no pudimos confirmar la reserva. Contactanos.</p>
        <Link href="/mis-viajes" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>Ver mis viajes</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(46,139,87,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '32px' }}>✓</div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 10px' }}>¡Reserva enviada!</h1>
        <p style={{ fontSize: '15px', color: 'var(--muted)', margin: '0 0 32px', lineHeight: 1.7 }}>
          Tu pago fue procesado. El conductor tiene que aceptar tu reserva — te avisamos cuando lo haga.
        </p>
        <Link href="/mis-viajes" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', marginBottom: '12px' }}>
          Ver mis viajes
        </Link>
        <br />
        <Link href="/buscar" style={{ fontSize: '14px', color: 'var(--navy)', textDecoration: 'none' }}>
          Buscar más viajes
        </Link>
      </div>
    </div>
  )
}

export default function PagoExitosoPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div>}>
      <PagoExitosoContenido />
    </Suspense>
  )
}
