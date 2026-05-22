'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function RegistroPage() {
  const router = useRouter()
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      setError(`Error: ${signUpError.message}`)
      setLoading(false)
      return
    }

    // Si el email ya está registrado, Supabase devuelve user con identities vacío
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError('Este email ya está registrado. ¿Querés iniciar sesión?')
      setLoading(false)
      return
    }

    // Crear perfil del usuario
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        nombre: form.nombre,
      })
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(46,139,87,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '24px' }}>✓</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 10px' }}>¡Cuenta creada!</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 28px', lineHeight: 1.7 }}>
            Te enviamos un email de confirmación a <strong>{form.email}</strong>. Confirmá tu cuenta y después iniciá sesión.
          </p>
          <Link href="/auth/login" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Crear cuenta</p>
          <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 8px' }}>Empezá a viajar<br />con confianza</h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0 }}>Gratis. Sin tarjeta de crédito.</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.18)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', color: '#b91c1c', margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Nombre completo</label>
            <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Tu nombre" className="input-field" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="nombre@ejemplo.com" className="input-field" required />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Mínimo 8 caracteres" className="input-field" minLength={8} required />
          </div>

          <button type="submit" disabled={loading} className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: '12px', marginTop: '4px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ fontSize: '12px', color: 'var(--subtle)', textAlign: 'center', margin: '16px 0 0', lineHeight: 1.6 }}>
          Al registrarte aceptás los{' '}
          <Link href="#" style={{ color: 'var(--navy)', textDecoration: 'none' }}>Términos de uso</Link>
          {' '}y la{' '}
          <Link href="#" style={{ color: 'var(--navy)', textDecoration: 'none' }}>Política de privacidad</Link>.
        </p>

        <hr className="divider" style={{ margin: '28px 0' }} />

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--muted)' }}>
          ¿Ya tenés cuenta?{' '}
          <Link href="/auth/login" style={{ color: 'var(--navy)', fontWeight: 600, textDecoration: 'none' }}>Iniciá sesión</Link>
        </p>
      </div>
    </div>
  )
}
