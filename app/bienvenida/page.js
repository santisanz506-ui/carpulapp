'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import CityInput from '../../components/CityInput'

const STEPS = [
  { id: 1, label: 'Tu rol' },
  { id: 2, label: 'Tu perfil' },
  { id: 3, label: 'Preferencias' },
]

const ROLES = [
  { value: 'pasajero', title: 'Pasajero', desc: 'Busco viajes para sumarme como acompañante.' },
  { value: 'conductor', title: 'Conductor', desc: 'Tengo auto y quiero publicar mis viajes.' },
  { value: 'ambos', title: 'Las dos cosas', desc: 'Según el caso viajo de una u otra forma.' },
]

const PREFS = [
  { key: 'musica', label: 'Música', options: [{ value: 'si', label: 'Me gusta' }, { value: 'no', label: 'Sin música' }, { value: 'indiferente', label: 'Me da igual' }] },
  { key: 'charla', label: 'Conversación', options: [{ value: 'si', label: 'Me gusta charlar' }, { value: 'no', label: 'Prefiero silencio' }, { value: 'indiferente', label: 'Me da igual' }] },
  { key: 'mascotas', label: 'Mascotas', options: [{ value: 'si', label: 'No me molestan' }, { value: 'no', label: 'Prefiero sin mascotas' }] },
  { key: 'paradas', label: 'Paradas en ruta', options: [{ value: 'pocas', label: 'Solo las necesarias' }, { value: 'flexibles', label: 'Flexibles' }] },
]

export default function BienvenidaPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [fotoFile, setFotoFile] = useState(null)
  const [fotoError, setFotoError] = useState('')
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    rol: '',
    edad: '',
    telefono: '',
    genero: '',
    ciudad: '',
    uso: '',
    preferencias: {},
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/auth/login')
      else setUser(user)
    })
  }, [])

  const setPref = (key, value) =>
    setForm(f => ({ ...f, preferencias: { ...f.preferencias, [key]: value } }))

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setFotoError('La foto no puede superar 5 MB.')
      return
    }
    setFotoError('')
    setFotoFile(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  const step2Valid = form.edad && form.telefono && form.genero && form.ciudad

  const handleFinish = async () => {
    setLoading(true)
    let foto_url = null

    if (fotoFile && user) {
      const ext = fotoFile.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, fotoFile, { upsert: true })

      if (!uploadError) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        foto_url = data.publicUrl
      }
    }

    await supabase.from('profiles').update({
      rol: form.rol,
      edad: form.edad ? parseInt(form.edad) : null,
      telefono: form.telefono,
      genero: form.genero,
      ciudad: form.ciudad,
      preferencias: form.preferencias,
      foto_url,
      onboarding_completado: true,
    }).eq('id', user.id)

    router.push('/')
  }

  // Barra de progreso
  const Progreso = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
      {STEPS.map((s, i) => (
        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: step > s.id ? 'var(--trust)' : step === s.id ? 'var(--navy)' : 'var(--border-md)',
              color: step >= s.id ? '#fff' : 'var(--subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, transition: 'background 0.2s'
            }}>
              {step > s.id ? '✓' : s.id}
            </div>
            <span style={{ fontSize: '12px', fontWeight: 500, color: step === s.id ? 'var(--dark)' : 'var(--subtle)', whiteSpace: 'nowrap' }}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: '1px', background: step > s.id ? 'var(--trust)' : 'var(--border-md)', transition: 'background 0.2s' }} />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <Progreso />

        {/* Step 1: Rol */}
        {step === 1 && (
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Paso 1 de 3</p>
            <h2 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 6px' }}>¿Cómo vas a usar Carpul Car?</h2>
            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 28px' }}>Podés cambiar esto después desde tu perfil.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
              {ROLES.map(r => (
                <button key={r.value} onClick={() => setForm(f => ({ ...f, rol: r.value }))} style={{
                  background: form.rol === r.value ? 'rgba(29,53,87,0.05)' : 'var(--surface)',
                  border: `1.5px solid ${form.rol === r.value ? 'var(--navy)' : 'var(--border-md)'}`,
                  borderRadius: '12px', padding: '16px 20px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 3px' }}>{r.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>{r.desc}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} disabled={!form.rol} className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: '12px', opacity: form.rol ? 1 : 0.4, cursor: form.rol ? 'pointer' : 'not-allowed' }}>
              Continuar
            </button>
          </div>
        )}

        {/* Step 2: Perfil */}
        {step === 2 && (
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Paso 2 de 3</p>
            <h2 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 6px' }}>Tu perfil</h2>
            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 28px' }}>Esto le da confianza a tus compañeros de viaje.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '32px' }}>

              {/* Foto */}
              <div>
                <label className="label">Foto de perfil</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
                      background: fotoPreview ? 'transparent' : 'rgba(29,53,87,0.07)',
                      border: `2px dashed ${fotoPreview ? 'var(--trust)' : 'var(--border-md)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.15s'
                    }}>
                    {fotoPreview
                      ? <img src={fotoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '22px' }}>📷</span>
                    }
                  </div>
                  <div>
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="btn-ghost" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}>
                      {fotoPreview ? 'Cambiar foto' : 'Subir foto'}
                    </button>
                    <p style={{ fontSize: '12px', color: 'var(--subtle)', margin: '6px 0 0' }}>JPG, PNG o WebP · Máx 5 MB</p>
                    {fotoError && <p style={{ fontSize: '12px', color: '#b91c1c', margin: '4px 0 0' }}>{fotoError}</p>}
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={handleFotoChange} style={{ display: 'none' }} />
              </div>

              {/* Género */}
              <div>
                <label className="label">Género <span style={{ color: '#b91c1c' }}>*</span></label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                  {['Masculino', 'Femenino', 'No binario', 'Prefiero no decir'].map(g => (
                    <button key={g} type="button" onClick={() => setForm(f => ({ ...f, genero: g }))}
                      style={{
                        padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 500,
                        background: form.genero === g ? 'var(--navy)' : 'var(--surface)',
                        color: form.genero === g ? '#fff' : 'var(--dark)',
                        border: `1px solid ${form.genero === g ? 'var(--navy)' : 'var(--border-md)'}`,
                        cursor: 'pointer', transition: 'all 0.15s'
                      }}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Edad + Teléfono */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label">Edad <span style={{ color: '#b91c1c' }}>*</span></label>
                  <input type="number" min="18" max="99" placeholder="Ej: 24"
                    value={form.edad} onChange={e => setForm(f => ({ ...f, edad: e.target.value }))}
                    className="input-field" required />
                </div>
                <div>
                  <label className="label">Teléfono <span style={{ color: '#b91c1c' }}>*</span></label>
                  <input type="tel" placeholder="11 1234-5678"
                    value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                    className="input-field" required />
                </div>
              </div>

              {/* Ciudad */}
              <div>
                <label className="label">Ciudad donde vivís <span style={{ color: '#b91c1c' }}>*</span></label>
                <CityInput
                  value={form.ciudad}
                  onChange={val => setForm(f => ({ ...f, ciudad: val }))}
                  placeholder="Ej: Buenos Aires"
                  required
                />
              </div>

              {/* Frecuencia */}
              <div>
                <label className="label">¿Con qué frecuencia viajás entre ciudades?</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  {['Casi nunca', 'Alguna vez al mes', 'Todas las semanas', 'Varias veces por semana'].map(op => (
                    <button key={op} type="button" onClick={() => setForm(f => ({ ...f, uso: op }))}
                      style={{
                        padding: '8px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 500,
                        background: form.uso === op ? 'var(--navy)' : 'var(--surface)',
                        color: form.uso === op ? '#fff' : 'var(--dark)',
                        border: `1px solid ${form.uso === op ? 'var(--navy)' : 'var(--border-md)'}`,
                        cursor: 'pointer', transition: 'all 0.15s'
                      }}>
                      {op}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(1)} className="btn-ghost" style={{ flex: 1, padding: '14px', borderRadius: '12px' }}>Atrás</button>
              <button onClick={() => setStep(3)} disabled={!step2Valid} className="btn-primary"
                style={{ flex: 2, padding: '14px', fontSize: '15px', borderRadius: '12px', opacity: step2Valid ? 1 : 0.4, cursor: step2Valid ? 'pointer' : 'not-allowed' }}>
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preferencias */}
        {step === 3 && (
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Paso 3 de 3</p>
            <h2 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 6px' }}>¿Cómo preferís viajar?</h2>
            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 28px' }}>Se muestra en tu perfil para que los compañeros sepan qué esperar.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
              {PREFS.map(pref => (
                <div key={pref.key}>
                  <label className="label">{pref.label}</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {pref.options.map(op => (
                      <button key={op.value} type="button" onClick={() => setPref(pref.key, op.value)}
                        style={{
                          padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 500,
                          background: form.preferencias[pref.key] === op.value ? 'var(--navy)' : 'var(--surface)',
                          color: form.preferencias[pref.key] === op.value ? '#fff' : 'var(--dark)',
                          border: `1px solid ${form.preferencias[pref.key] === op.value ? 'var(--navy)' : 'var(--border-md)'}`,
                          cursor: 'pointer', transition: 'all 0.15s'
                        }}>
                        {op.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(2)} className="btn-ghost" style={{ flex: 1, padding: '14px', borderRadius: '12px' }}>Atrás</button>
              <button onClick={handleFinish} disabled={loading} className="btn-primary"
                style={{ flex: 2, padding: '14px', fontSize: '15px', borderRadius: '12px', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Guardando...' : '¡Listo, empezar!'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
