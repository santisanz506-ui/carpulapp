'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import CityInput from '../../components/CityInput'
import Link from 'next/link'

const PREFS = [
  { key: 'musica', label: 'Música', options: [{ value: 'si', label: 'Me gusta' }, { value: 'no', label: 'Sin música' }, { value: 'indiferente', label: 'Me da igual' }] },
  { key: 'charla', label: 'Conversación', options: [{ value: 'si', label: 'Me gusta charlar' }, { value: 'no', label: 'Prefiero silencio' }, { value: 'indiferente', label: 'Me da igual' }] },
  { key: 'mascotas', label: 'Mascotas', options: [{ value: 'si', label: 'No me molestan' }, { value: 'no', label: 'Prefiero sin mascotas' }] },
  { key: 'paradas', label: 'Paradas en ruta', options: [{ value: 'pocas', label: 'Solo las necesarias' }, { value: 'flexibles', label: 'Flexibles' }] },
]

const ROLES = [
  { value: 'pasajero', label: 'Pasajero' },
  { value: 'conductor', label: 'Conductor' },
  { value: 'ambos', label: 'Las dos cosas' },
]

export default function PerfilPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [fotoFile, setFotoFile] = useState(null)
  const [fotoError, setFotoError] = useState('')
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    nombre: '', genero: '', edad: '', telefono: '',
    ciudad: '', rol: '', uso: '', preferencias: {}
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setForm({
            nombre: data.nombre || '',
            genero: data.genero || '',
            edad: data.edad || '',
            telefono: data.telefono || '',
            ciudad: data.ciudad || '',
            rol: data.rol || '',
            uso: data.uso || '',
            preferencias: data.preferencias || {},
          })
          if (data.foto_url) setFotoPreview(data.foto_url)
        }
        setLoading(false)
      })
    })
  }, [])

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setFotoError('La foto no puede superar 5 MB.'); return }
    setFotoError('')
    setFotoFile(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  const setPref = (key, value) =>
    setForm(f => ({ ...f, preferencias: { ...f.preferencias, [key]: value } }))

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    let foto_url = fotoPreview?.startsWith('blob:') ? null : fotoPreview

    if (fotoFile && user) {
      const ext = fotoFile.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars').upload(path, fotoFile, { upsert: true })
      if (!uploadError) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        foto_url = data.publicUrl
      }
    }

    await supabase.from('profiles').update({
      nombre: form.nombre,
      genero: form.genero,
      edad: form.edad ? parseInt(form.edad) : null,
      telefono: form.telefono,
      ciudad: form.ciudad,
      rol: form.rol,
      uso: form.uso,
      preferencias: form.preferencias,
      ...(foto_url && { foto_url }),
    }).eq('id', user.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const initials = form.nombre
    ? form.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  if (loading) return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px', opacity: 0.4 }}>
      <div style={{ height: '100px', background: 'var(--border)', borderRadius: '16px' }} />
    </div>
  )

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div onClick={() => fileInputRef.current?.click()} style={{
            width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden',
            background: 'rgba(29,53,87,0.08)', border: '3px solid var(--surface)',
            boxShadow: '0 0 0 2px var(--border-md)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {fotoPreview
              ? <img src={fotoPreview} alt="foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--navy)' }}>{initials}</span>
            }
          </div>
          <div onClick={() => fileInputRef.current?.click()} style={{
            position: 'absolute', bottom: 0, right: 0,
            width: '24px', height: '24px', borderRadius: '50%',
            background: 'var(--navy)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', cursor: 'pointer', border: '2px solid var(--surface)'
          }}>✎</div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
            onChange={handleFotoChange} style={{ display: 'none' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 4px' }}>
            {form.nombre || 'Tu perfil'}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 8px' }}>{user?.email}</p>
          {fotoError && <p style={{ fontSize: '12px', color: '#b91c1c', margin: 0 }}>{fotoError}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Datos personales */}
        <div className="card" style={{ padding: '28px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 20px' }}>Datos personales</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="label">Nombre completo</label>
              <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                placeholder="Tu nombre" className="input-field" />
              <p style={{ fontSize: '12px', color: 'var(--subtle)', margin: '5px 0 0' }}>
                📋 Debe coincidir exactamente con tu DNI. Se verificará al activar tu cuenta.
              </p>
            </div>
            <div>
              <label className="label">Género</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                {['Masculino', 'Femenino'].map(g => (
                  <button key={g} type="button" onClick={() => setForm({ ...form, genero: g })}
                    style={{
                      padding: '7px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 500,
                      background: form.genero === g ? 'var(--navy)' : 'transparent',
                      color: form.genero === g ? '#fff' : 'var(--dark)',
                      border: `1px solid ${form.genero === g ? 'var(--navy)' : 'var(--border-md)'}`,
                      cursor: 'pointer', transition: 'all 0.15s'
                    }}>{g}</button>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--subtle)', margin: '5px 0 0' }}>
                📋 Tal como figura en tu DNI.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="label">Edad</label>
                <input type="number" min="18" max="99" value={form.edad}
                  onChange={e => setForm({ ...form, edad: e.target.value })}
                  placeholder="Ej: 24" className="input-field" />
              </div>
              <div>
                <label className="label">Teléfono</label>
                <input type="tel" value={form.telefono}
                  onChange={e => setForm({ ...form, telefono: e.target.value })}
                  placeholder="11 1234-5678" className="input-field" />
              </div>
            </div>
            <div>
              <label className="label">Ciudad donde vivís</label>
              <CityInput value={form.ciudad} onChange={val => setForm({ ...form, ciudad: val })} placeholder="Ej: Buenos Aires" />
            </div>
          </div>
        </div>

        {/* Rol */}
        <div className="card" style={{ padding: '28px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 16px' }}>¿Cómo usás Carpul Car?</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {ROLES.map(r => (
              <button key={r.value} type="button" onClick={() => setForm({ ...form, rol: r.value })}
                style={{
                  padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 500,
                  background: form.rol === r.value ? 'var(--navy)' : 'transparent',
                  color: form.rol === r.value ? '#fff' : 'var(--dark)',
                  border: `1.5px solid ${form.rol === r.value ? 'var(--navy)' : 'var(--border-md)'}`,
                  cursor: 'pointer', transition: 'all 0.15s'
                }}>{r.label}</button>
            ))}
          </div>
        </div>

        {/* Preferencias */}
        <div className="card" style={{ padding: '28px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 20px' }}>Preferencias de viaje</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {PREFS.map(pref => (
              <div key={pref.key}>
                <label className="label">{pref.label}</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {pref.options.map(op => (
                    <button key={op.value} type="button" onClick={() => setPref(pref.key, op.value)}
                      style={{
                        padding: '7px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 500,
                        background: form.preferencias[pref.key] === op.value ? 'var(--navy)' : 'transparent',
                        color: form.preferencias[pref.key] === op.value ? '#fff' : 'var(--dark)',
                        border: `1px solid ${form.preferencias[pref.key] === op.value ? 'var(--navy)' : 'var(--border-md)'}`,
                        cursor: 'pointer', transition: 'all 0.15s'
                      }}>{op.label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Links rápidos */}
        <div className="card" style={{ padding: '20px 28px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dark)', margin: 0 }}>Accesos rápidos</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link href="/mis-autos" style={{ fontSize: '13px', color: 'var(--navy)', textDecoration: 'none', fontWeight: 500, padding: '7px 14px', border: '1px solid var(--border-md)', borderRadius: '8px' }}>
              🚗 Mis autos
            </Link>
            <Link href="/mis-viajes" style={{ fontSize: '13px', color: 'var(--navy)', textDecoration: 'none', fontWeight: 500, padding: '7px 14px', border: '1px solid var(--border-md)', borderRadius: '8px' }}>
              🗺 Mis viajes
            </Link>
            <Link href="/mensajes" style={{ fontSize: '13px', color: 'var(--navy)', textDecoration: 'none', fontWeight: 500, padding: '7px 14px', border: '1px solid var(--border-md)', borderRadius: '8px' }}>
              💬 Mensajes
            </Link>
          </div>
        </div>

        {/* Botón guardar */}
        <button onClick={handleSave} disabled={saving} className="btn-primary"
          style={{ width: '100%', padding: '16px', fontSize: '15px', borderRadius: '12px', opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer', background: saved ? 'var(--trust)' : undefined }}>
          {saving ? 'Guardando...' : saved ? '¡Guardado ✓' : 'Guardar cambios'}
        </button>

      </div>
    </div>
  )
}
