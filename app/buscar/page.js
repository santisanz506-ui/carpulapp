'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import TripCard from '../../components/TripCard'
import SearchForm from '../../components/SearchForm'
import Link from 'next/link'

function BuscarContenido() {
  const searchParams = useSearchParams()
  const origen = searchParams.get('origen') || ''
  const destino = searchParams.get('destino') || ''
  const fecha = searchParams.get('fecha') || ''

  const [viajes, setViajes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchViajes()
  }, [origen, destino, fecha])

  const fetchViajes = async () => {
    setLoading(true)

    let query = supabase
      .from('viajes')
      .select(`*, conductor:profiles(nombre, rating, foto_url, total_viajes)`)
      .eq('activo', true)
      .gte('fecha', new Date().toISOString().split('T')[0])
      .order('fecha', { ascending: true })
      .order('hora_salida', { ascending: true })

    if (origen) query = query.ilike('origen', `%${origen}%`)
    if (destino) query = query.ilike('destino', `%${destino}%`)
    if (fecha) query = query.eq('fecha', fecha)

    const { data, error } = await query

    if (!error && data) {
      setViajes(data.map(v => ({
        id: v.id,
        origen: v.origen,
        destino: v.destino,
        fecha: v.fecha,
        hora_salida: v.hora_salida?.slice(0, 5),
        precio: v.precio,
        asientos_disponibles: v.asientos_disponibles,
        punto_encuentro: v.punto_encuentro,
        conductor_nombre: v.conductor?.nombre || 'Usuario',
        conductor_rating: v.conductor?.rating || null,
        conductor_foto: v.conductor?.foto_url || null,
      })))
    }

    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <SearchForm compact />
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 4px' }}>
            {origen && destino ? `${origen} → ${destino}` : 'Todos los viajes'}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
            {loading ? 'Buscando...' : `${viajes.length} ${viajes.length === 1 ? 'viaje disponible' : 'viajes disponibles'}${fecha ? ` · ${fecha}` : ''}`}
          </p>
        </div>
        <span className="badge-navy">Conductores verificados ✓</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ padding: '24px', opacity: 0.4 }}>
              <div style={{ height: '80px', background: 'var(--border)', borderRadius: '8px' }} />
            </div>
          ))}
        </div>
      ) : viajes.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {viajes.map(viaje => <TripCard key={viaje.id} trip={viaje} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontSize: '32px', marginBottom: '16px' }}>🔍</p>
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 8px' }}>
            No hay viajes para esta ruta todavía.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 28px' }}>
            Probá con otra fecha o destino.
          </p>
          <Link href="/publicar" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            Publicar un viaje
          </Link>
        </div>
      )}
    </div>
  )
}

export default function BuscarPage() {
  return (
    <Suspense fallback={
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ height: '80px', background: 'var(--border)', borderRadius: '12px', marginBottom: '32px', opacity: 0.4 }} />
      </div>
    }>
      <BuscarContenido />
    </Suspense>
  )
}
