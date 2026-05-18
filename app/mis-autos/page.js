'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

const MARCAS = ['Acura','Alfa Romeo','Audi','BMW','Chevrolet','Chrysler','Citroën','Dodge','Ferrari','Fiat','Ford','Honda','Hyundai','Infiniti','Jaguar','Jeep','Kia','Land Rover','Lexus','Maserati','Mazda','Mercedes-Benz','Mini','Mitsubishi','Nissan','Peugeot','Porsche','Ram','Renault','SEAT','Skoda','Subaru','Suzuki','Toyota','Volkswagen','Volvo','Otro']
const COLORES = ['Blanco', 'Negro', 'Gris', 'Plata', 'Rojo', 'Azul', 'Verde', 'Celeste', 'Beige', 'Bordó', 'Naranja', 'Amarillo', 'Otro']

function MarcaInput({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const ref = useRef(null)

  const filtered = value.length >= 1
    ? MARCAS.filter(m => m.toLowerCase().includes(value.toLowerCase())).slice(0, 6)
    : []

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (marca) => { onChange(marca); setOpen(false) }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input type="text" value={value} placeholder="Ej: Peugeot, Fiat..." required
        className="input-field" autoComplete="off"
        onChange={e => { onChange(e.target.value); setHighlighted(0); setOpen(true) }}
        onFocus={() => { if (value.length >= 1) setOpen(true) }}
        onKeyDown={e => {
          if (!open || filtered.length === 0) return
          if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)) }
          if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
          if (e.key === 'Enter') { e.preventDefault(); select(filtered[highlighted]) }
          if (e.key === 'Escape') setOpen(false)
        }}
      />
      {open && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border-md)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 200, overflow: 'hidden' }}>
          {filtered.map((m, i) => (
            <button key={m} type="button" onMouseEnter={() => setHighlighted(i)} onMouseDown={() => select(m)}
              style={{ display: 'block', width: '100%', padding: '10px 14px', background: highlighted === i ? 'rgba(29,53,87,0.05)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '14px', color: 'var(--dark)', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MisAutosPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [autos, setAutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    marca: '', modelo: '', anio: '', color: '', patente: '', puertas: '4', aire: false, mascota: false
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/auth/login')
      else { setUser(user); fetchAutos(user.id) }
    })
  }, [])

  const fetchAutos = async (uid) => {
    const { data } = await supabase
      .from('autos')
      .select('*')
      .eq('conductor_id', uid)
      .order('created_at', { ascending: false })
    setAutos(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const patente = form.patente.toUpperCase().replace(/\s/g, '')
    if (patente.length < 6 || patente.length > 7) {
      setError('Ingresá la patente completa (ej: ABC123 o AB123CD).')
      setSaving(false)
      return
    }

    const { error: err } = await supabase.from('autos').insert({
      conductor_id: user.id,
      marca: form.marca,
      modelo: form.modelo,
      anio: form.anio ? parseInt(form.anio) : null,
      color: form.color,
      patente_fin: patente,
      puertas: parseInt(form.puertas),
      aire_acondicionado: form.aire,
      permite_mascotas: form.mascota,
    })

    if (err) {
      setError('No se pudo guardar el auto. Revisá los datos.')
      setSaving(false)
      return
    }

    setForm({ marca: '', modelo: '', anio: '', color: '', patente: '', puertas: '4', aire: false, mascota: false })
    setShowForm(false)
    fetchAutos(user.id)
    setSaving(false)
  }

  const eliminarAuto = async (id) => {
    await supabase.from('autos').delete().eq('id', id)
    setAutos(autos.filter(a => a.id !== id))
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Conductor</p>
          <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 6px' }}>Mis autos</h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0 }}>Registrá los vehículos con los que viajás.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary" style={{ borderRadius: '10px' }}>
            + Agregar auto
          </button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 20px' }}>Nuevo auto</p>

          {error && (
            <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.18)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: '#b91c1c', margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="label">Marca</label>
                <MarcaInput value={form.marca} onChange={val => setForm({ ...form, marca: val })} />
              </div>
              <div>
                <label className="label">Modelo</label>
                <input type="text" placeholder="Ej: 208, Cronos, Ka" value={form.modelo}
                  onChange={e => setForm({ ...form, modelo: e.target.value })}
                  className="input-field" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div>
                <label className="label">Año</label>
                <input type="number" placeholder="2020" min="1990" max={new Date().getFullYear()} value={form.anio}
                  onChange={e => setForm({ ...form, anio: e.target.value })}
                  className="input-field" />
              </div>
              <div>
                <label className="label">Color</label>
                <select value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="input-field" required>
                  <option value="">Color</option>
                  {COLORES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Patente</label>
                <input type="text" placeholder="Ej: AB123CD" maxLength={7} value={form.patente}
                  onChange={e => setForm({ ...form, patente: e.target.value.toUpperCase().replace(/\s/g, '') })}
                  className="input-field" required
                  style={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="label">Puertas</label>
                <select value={form.puertas} onChange={e => setForm({ ...form, puertas: e.target.value })} className="input-field">
                  <option value="2">2 puertas</option>
                  <option value="4">4 puertas</option>
                  <option value="5">5 puertas / SUV</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '10px', paddingBottom: '2px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.aire} onChange={e => setForm({ ...form, aire: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--navy)' }} />
                  <span style={{ fontSize: '13px', color: 'var(--dark)' }}>Aire acondicionado</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.mascota} onChange={e => setForm({ ...form, mascota: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--navy)' }} />
                  <span style={{ fontSize: '13px', color: 'var(--dark)' }}>Permite mascotas</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button type="submit" disabled={saving} className="btn-primary" style={{ borderRadius: '10px', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Guardando...' : 'Guardar auto'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError('') }} className="btn-ghost" style={{ borderRadius: '10px' }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de autos */}
      {loading ? (
        <div style={{ opacity: 0.4 }}>
          {[1, 2].map(i => <div key={i} className="card" style={{ padding: '24px', marginBottom: '10px', height: '80px' }} />)}
        </div>
      ) : autos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontSize: '40px', marginBottom: '12px' }}>🚗</p>
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 6px' }}>Todavía no tenés autos registrados</p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0 }}>Agregá tu auto para poder publicar viajes.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {autos.map(auto => (
            <div key={auto.id} className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(29,53,87,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                  🚗
                </div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 3px' }}>
                    {auto.marca} {auto.modelo} {auto.anio && `(${auto.anio})`}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{auto.color}</span>
                    <span style={{ fontSize: '12px', color: 'var(--subtle)' }}>·</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy)', letterSpacing: '0.06em' }}>···{auto.patente_fin}</span>
                    {auto.aire_acondicionado && <span style={{ fontSize: '11px', background: 'rgba(46,139,87,0.1)', color: 'var(--trust)', padding: '2px 8px', borderRadius: '20px', fontWeight: 500 }}>❄ Aire</span>}
                    {auto.permite_mascotas && <span style={{ fontSize: '11px', background: 'rgba(29,53,87,0.08)', color: 'var(--navy)', padding: '2px 8px', borderRadius: '20px', fontWeight: 500 }}>🐾 Mascotas</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => eliminarAuto(auto.id)}
                style={{ fontSize: '13px', color: '#b91c1c', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', flexShrink: 0, opacity: 0.7 }}
                title="Eliminar auto">
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <Link href="/publicar" style={{ fontSize: '14px', color: 'var(--navy)', textDecoration: 'none', fontWeight: 500 }}>
          → Publicar un viaje
        </Link>
      </div>
    </div>
  )
}
