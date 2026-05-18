'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (signInError) {
      setError('Email o contraseña incorrectos. Revisá tus datos.')
      setLoading(false)
      return
    }

    // Verificar si completó el onboarding
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('onboarding_completado').eq('id', user.id).single()
      if (!profile?.onboarding_completado) {
        router.push('/bienvenida')
        return
      }
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Bienvenido de nuevo</p>
          <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 8px' }}>Iniciá sesión en<br />Carpul Car</h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0 }}>Accedé a tus viajes y reservas.</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.18)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', color: '#b91c1c', margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="nombre@ejemplo.com" className="input-field" required />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••" className="input-field" required />
          </div>

          <button type="submit" disabled={loading} className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: '12px', marginTop: '4px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
          <Link href="#" style={{ fontSize: '13px', color: 'var(--navy)', textDecoration: 'none', fontWeight: 500 }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <hr className="divider" style={{ margin: '28px 0' }} />

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--muted)' }}>
          ¿No tenés cuenta?{' '}
          <Link href="/auth/registro" style={{ color: 'var(--navy)', fontWeight: 600, textDecoration: 'none' }}>Registrate gratis</Link>
        </p>
      </div>
    </div>
  )
}
