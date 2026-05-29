'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [reservasPendientes, setReservasPendientes] = useState(0)
  const menuRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    fetchPendientes(userId)
  }

  const fetchPendientes = async (userId) => {
    const { data: viajes } = await supabase
      .from('viajes')
      .select('id')
      .eq('conductor_id', userId)
    if (!viajes || viajes.length === 0) return
    const viajeIds = viajes.map(v => v.id)
    const { count } = await supabase
      .from('reservas')
      .select('id', { count: 'exact', head: true })
      .in('viaje_id', viajeIds)
      .eq('estado', 'pendiente')
    setReservasPendientes(count || 0)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUserMenuOpen(false)
    setUser(null)
    setProfile(null)
    router.push('/')
  }

  const initials = profile?.nombre
    ? profile.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.03em', color: 'var(--navy)' }}>Carpul Car</span>
        </Link>

        {/* Desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="nav-desktop">
          <Link href="/buscar" style={{ textDecoration: 'none', fontSize: '14px', color: 'var(--muted)', padding: '8px 14px', fontWeight: 500 }}>
            Buscar viaje
          </Link>
          <Link href="/publicar" style={{ textDecoration: 'none', fontSize: '14px', color: 'var(--muted)', padding: '8px 14px', fontWeight: 500 }}>
            Publicar viaje
          </Link>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-md)', margin: '0 4px' }} />

          {user ? (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{
                display: 'flex', alignItems: 'center', gap: '8px', background: 'none',
                border: '1px solid var(--border-md)', borderRadius: '10px',
                padding: '6px 12px 6px 6px', cursor: 'pointer'
              }}>
                {profile?.foto_url ? (
                  <img src={profile.foto_url} alt="foto" style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    objectFit: 'cover', flexShrink: 0
                  }} />
                ) : (
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'var(--navy)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 700, flexShrink: 0
                  }}>
                    {initials}
                  </div>
                )}
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--dark)' }}>
                  {profile?.nombre?.split(' ')[0] ?? 'Mi cuenta'}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--subtle)' }}>▾</span>
              </button>

              {userMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                  minWidth: '200px', overflow: 'hidden', zIndex: 100
                }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 2px' }}>{profile?.nombre ?? 'Usuario'}</p>
                    <p style={{ fontSize: '12px', color: 'var(--subtle)', margin: 0 }}>{user.email}</p>
                  </div>
                  {[
                    { href: '/perfil', label: 'Mi perfil' },
                    { href: '/mis-viajes', label: 'Mis viajes', badge: reservasPendientes },
                    { href: '/mis-autos', label: 'Mis autos 🚗' },
                    { href: '/mensajes', label: 'Mensajes 💬' },
                    { href: '/configuracion', label: 'Configuración' },
                  ].map(({ href, label, badge }) => (
                    <Link key={href} href={href} onClick={() => setUserMenuOpen(false)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '11px 16px',
                      fontSize: '13px', color: 'var(--dark)', textDecoration: 'none',
                      fontWeight: 500, borderBottom: '1px solid var(--border)'
                    }}>
                      {label}
                      {badge > 0 && (
                        <span style={{ fontSize: '11px', fontWeight: 700, background: '#dc2626', color: '#fff', borderRadius: '20px', padding: '2px 7px', minWidth: '18px', textAlign: 'center' }}>
                          {badge}
                        </span>
                      )}
                    </Link>
                  ))}
                  <button onClick={handleLogout} style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '11px 16px', fontSize: '13px', color: '#b91c1c',
                    background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500
                  }}>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" style={{ textDecoration: 'none', fontSize: '14px', color: 'var(--dark)', padding: '8px 14px', fontWeight: 500 }}>
                Iniciar sesión
              </Link>
              <Link href="/auth/registro" className="btn-primary" style={{ padding: '9px 20px', fontSize: '14px', borderRadius: '10px', textDecoration: 'none' }}>
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="nav-mobile" onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', fontSize: '20px', color: 'var(--dark)' }}>
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[{ href: '/buscar', label: 'Buscar viaje' }, { href: '/publicar', label: 'Publicar viaje' }].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              style={{ textDecoration: 'none', fontSize: '15px', color: 'var(--dark)', padding: '12px 0', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>
              {label}
            </Link>
          ))}
          {user ? (
            <>
              {[
                { href: '/perfil', label: 'Mi perfil' },
                { href: '/mis-autos', label: 'Mis autos 🚗' },
                { href: '/mensajes', label: 'Mensajes 💬' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                  style={{ textDecoration: 'none', fontSize: '15px', color: 'var(--dark)', padding: '12px 0', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>
                  {label}
                </Link>
              ))}
              <button onClick={handleLogout}
                style={{ background: 'none', border: 'none', textAlign: 'left', fontSize: '15px', color: '#b91c1c', padding: '12px 0', fontWeight: 500, cursor: 'pointer' }}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                style={{ textDecoration: 'none', fontSize: '15px', color: 'var(--dark)', padding: '12px 0', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>
                Iniciar sesión
              </Link>
              <Link href="/auth/registro" onClick={() => setMobileOpen(false)} className="btn-primary"
                style={{ marginTop: '12px', textDecoration: 'none', justifyContent: 'center' }}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 700px) { .nav-desktop { display: none !important; } }
        @media (min-width: 701px) { .nav-mobile { display: none !important; } }
      `}</style>
    </nav>
  )
}
