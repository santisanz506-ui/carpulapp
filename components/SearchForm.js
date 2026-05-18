'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CityInput from './CityInput'

export default function SearchForm({ compact = false }) {
  const router = useRouter()
  const [form, setForm] = useState({ origen: '', destino: '', fecha: '', pasajeros: 3 })

  const handleSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams(form)
    router.push(`/buscar?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'var(--surface)',
      borderRadius: compact ? '14px' : '18px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.05)',
      padding: compact ? '16px' : '24px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '12px',
      alignItems: 'end',
    }}>
      <div>
        <label className="label">Desde</label>
        <CityInput
          value={form.origen}
          onChange={val => setForm({ ...form, origen: val })}
          placeholder="Ciudad de origen"
          required
        />
      </div>

      <div>
        <label className="label">Hasta</label>
        <CityInput
          value={form.destino}
          onChange={val => setForm({ ...form, destino: val })}
          placeholder="Ciudad de destino"
          required
        />
      </div>

      <div>
        <label className="label">Fecha</label>
        <input
          type="date"
          value={form.fecha}
          onChange={e => setForm({ ...form, fecha: e.target.value })}
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="label">Pasajeros</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            value={form.pasajeros}
            onChange={e => setForm({ ...form, pasajeros: e.target.value })}
            className="input-field"
            style={{ flex: 1 }}
          >
            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>)}
          </select>
          <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap', borderRadius: '10px' }}>
            Buscar
          </button>
        </div>
      </div>
    </form>
  )
}
