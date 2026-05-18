import './globals.css'
import Navbar from '../components/Navbar'

export const metadata = {
  title: 'Carpul Car — Viajes compartidos verificados',
  description: 'La forma más inteligente de viajar entre ciudades en Argentina.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)', marginTop: '80px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '40px' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '15px', letterSpacing: '-0.02em', marginBottom: '8px', color: 'var(--dark)' }}>Carpul Car</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>La forma más inteligente de viajar entre ciudades en Argentina.</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Plataforma</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Buscar viaje', 'Publicar viaje', 'Cómo funciona'].map(l => (
                  <a key={l} href="#" style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'none' }}>{l}</a>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Seguridad</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Verificación de identidad', 'Cómo calificamos', 'Centro de ayuda'].map(l => (
                  <a key={l} href="#" style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'none' }}>{l}</a>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Legal</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Términos de uso', 'Privacidad'].map(l => (
                  <a key={l} href="#" style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'none' }}>{l}</a>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', maxWidth: '1100px', margin: '0 auto', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--subtle)', margin: 0 }}>© 2025 Carpul Car. Todos los derechos reservados.</p>
            <p style={{ fontSize: '12px', color: 'var(--subtle)', margin: 0 }}>Argentina 🇦🇷</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
