'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import CityInput from '../../components/CityInput'
import Link from 'next/link'

export default function PublicarPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [autos, setAutos] = useState([])
  const [loadingAutos, setLoadingAutos] = useState(true)
  const [form, setForm] = useState({
    origen: '', destino: '', fecha: '', hora: '',
    asientos: 3, precio: '', punto_encuentro: '', descripcion: '', auto_id: ''
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/auth/login')
      else {
        setUser(user)
        fetchAutos(user.id)
      }
    })
  }, [])

  const fetchAutos = async (uid) => {
    const { data } = await supabase
      .from('autos')
      .select('*')
      .eq('conductor_id', uid)
      .order('created_at', { ascending: false })
    setAutos(data || [])
    if (data && data.length === 1) setForm(f => ({ ...f, auto_id: data[0].id }))
    setLoadingAutos(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.auto_id) {
      setError('Seleccioná el auto con el que vas a viajar.')
      return
    }
    setLoading(true)
    setError('')

    const { error: insertError } = await supabase.from('viajes').insert({
      conductor_id: user.id,
      auto_id: form.auto_id,
      origen: form.origen,
      destino: form.destino,
      fecha: form.fecha,
      hora_salida: form.hora,
      asientos_disponibles: parseInt(form.asientos),
      precio: parseFloat(form.precio),
      punto_encuentro: form.punto_encuentro || null,
      descripcion: form.descripcion || null,
    })

    if (insertError) {
      console.error('Supabase error:', insertError)
      setError(`Error: ${insertError.message} (código: ${insertError.code})`)
      setLoading(false)
      return
    }

    router.push(`/buscar?origen=${form.origen}&destino=${form.destino}`)
  }

  const autoSeleccionado = autos.find(a => a.id === form.auto_id)

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Conductor</p>
        <h1 style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 8px' }}>Publicá tu próximo viaje</h1>
        <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0 }}>Completá los datos y encontrá pasajeros verificados para compartir el recorrido.</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.18)', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px' }}>
          <p style={{ fontSize: '13px', color: '#b91c1c', margin: 0 }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Auto */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dark)', letterSpacing: '-0.01em', margin: 0 }}>Tu auto</p>
            <Link href="/mis-autos" style={{ fontSize: '12px', color: 'var(--navy)', textDecoration: 'none', fontWeight: 500 }}>
              + Agregar auto
            </Link>
          </div>

          {loadingAutos ? (
            <div style={{ height: '52px', background: 'var(--border)', borderRadius: '10px', opacity: 0.4 }} />
          ) : autos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(29,53,87,0.04)', borderRadius: '12px' }}>
              <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 12px' }}>Todavía no tenés autos registrados.</p>
              <Link href="/mis-autos" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', fontSize: '13px', padding: '8px 16px', borderRadius: '8px' }}>
                Registrar mi auto →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {autos.map(auto => (
                <label key={auto.id} style={{
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
                  borderRadius: '12px', cursor: 'pointer', border: '1.5px solid',
                  borderColor: form.auto_id === auto.id ? 'var(--navy)' : 'var(--border-md)',
                  background: form.auto_id === auto.id ? 'rgba(29,53,87,0.04)' : 'transparent',
                  transition: 'all 0.15s'
                }}>
                  <input type="radio" name="auto_id" value={auto.id}
                    checked={form.auto_id === auto.id}
                    onChange={() => setForm({ ...form, auto_id: auto.id })}
                    style={{ accentColor: 'var(--navy)', width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '22px' }}>🚗</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 2px' }}>
                      {auto.marca} {auto.modelo} {auto.anio && `(${auto.anio})`}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
                      {auto.color} · <span style={{ fontWeight: 600, letterSpacing: '0.06em' }}>···{auto.patente_fin}</span>
                      {auto.aire_acondicionado && ' · ❄ Aire'}
                      {auto.permite_mascotas && ' · 🐾 Mascotas'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Ruta */}
        <div className="card" style={{ padding: '28px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dark)', letterSpacing: '-0.01em', margin: '0 0 20px' }}>Ruta</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="label">Ciudad de origen</label>
              <CityInput value={form.origen} onChange={val => setForm({ ...form, origen: val })} placeholder="Ej: Buenos Aires" required />
            </div>
            <div>
              <label className="label">Ciudad de destino</label>
              <CityInput value={form.destino} onChange={val => setForm({ ...form, destino: val })} placeholder="Ej: Córdoba" required />
            </div>
          </div>
        </div>

        {/* Fecha y hora */}
        <div className="card" style={{ padding: '28px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dark)', letterSpacing: '-0.01em', margin: '0 0 20px' }}>Fecha y horario</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="label">Fecha de salida</label>
              <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })}
                className="input-field" required min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="label">Hora de salida</label>
              <input type="time" value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })}
                className="input-field" required />
            </div>
          </div>
        </div>

        {/* Asientos y precio */}
        <div className="card" style={{ padding: '28px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dark)', letterSpacing: '-0.01em', margin: '0 0 20px' }}>Lugares y precio</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="label">Asientos disponibles</label>
              <select value={form.asientos} onChange={e => setForm({ ...form, asientos: e.target.value })} className="input-field">
                {[1, 2, 3].map(n => <option key={n} value={n}>{n} {n === 1 ? 'lugar' : 'lugares'}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Precio por persona ($)</label>
              <input type="number" placeholder="Ej: 12000" min="0" value={form.precio}
                onChange={e => setForm({ ...form, precio: e.target.value })} className="input-field" required />
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--subtle)', margin: '12px 0 0', lineHeight: 1.6 }}>
            Recomendamos un precio que cubra nafta y peajes sin generar ganancia. Los pasajeros confían más en precios justos.
          </p>
        </div>

        {/* Encuentro y descripción */}
        <div className="card" style={{ padding: '28px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dark)', letterSpacing: '-0.01em', margin: '0 0 20px' }}>Detalles del viaje</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="label">Punto de encuentro</label>
              <input type="text" placeholder="Ej: Estación Retiro, puerta principal"
                value={form.punto_encuentro} onChange={e => setForm({ ...form, punto_encuentro: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="label">Descripción (opcional)</label>
              <textarea placeholder="Contale a los pasajeros detalles: paradas, música, paradas intermedias, etc."
                value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
                className="input-field" rows={3} style={{ resize: 'none' }} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading || autos.length === 0} className="btn-primary"
          style={{ width: '100%', padding: '16px', fontSize: '15px', borderRadius: '12px', opacity: (loading || autos.length === 0) ? 0.7 : 1, cursor: (loading || autos.length === 0) ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Publicando...' : 'Publicar viaje'}
        </button>

        <p style={{ fontSize: '12px', color: 'var(--subtle)', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
          Al publicar confirmás que contás con licencia de conducir vigente y seguro del vehículo al día.
        </p>
      </form>
    </div>
  )
}
