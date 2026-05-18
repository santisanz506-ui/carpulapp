'use client'
import { useState, useRef, useEffect } from 'react'
import { CIUDADES } from '../lib/ciudades'

export default function CityInput({ value, onChange, placeholder = 'Ciudad', required = false }) {
  const [query, setQuery] = useState(value || '')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const containerRef = useRef(null)

  const filtered = query.length >= 1
    ? CIUDADES.filter(c =>
        c.nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
          .includes(query.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''))
      ).slice(0, 7)
    : []

  useEffect(() => {
    setQuery(value || '')
  }, [value])

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const select = (ciudad) => {
    setQuery(ciudad.nombre)
    onChange(ciudad.nombre)
    setOpen(false)
  }

  const handleKeyDown = (e) => {
    if (!open || filtered.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
    if (e.key === 'Enter') { e.preventDefault(); select(filtered[highlighted]) }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className="input-field"
        onChange={e => {
          setQuery(e.target.value)
          onChange(e.target.value)
          setHighlighted(0)
          setOpen(true)
        }}
        onFocus={() => { if (query.length >= 1) setOpen(true) }}
        onKeyDown={handleKeyDown}
      />

      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: 'var(--surface)', border: '1px solid var(--border-md)',
          borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          zIndex: 200, overflow: 'hidden'
        }}>
          {filtered.map((ciudad, i) => (
            <button
              key={ciudad.nombre}
              type="button"
              onMouseEnter={() => setHighlighted(i)}
              onMouseDown={() => select(ciudad)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                width: '100%', padding: '11px 16px', background: highlighted === i ? 'rgba(29,53,87,0.05)' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none'
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--dark)' }}>{ciudad.nombre}</span>
              <span style={{ fontSize: '12px', color: 'var(--subtle)' }}>{ciudad.region}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
