// app/client-login/page.js
import ClientLogin from '../../components/ClientLogin';

export default function ClientLoginPage() {
  return (
    <main className="min-h-screen">
      <header className="site-header">
        <div className="page-wrapper" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <a href="/" className="brand">KaamConnect</a>
          <nav className="site-nav">
            <a href="/client-signup">Client Sign up</a>
            <a href="/search">Search</a>
          </nav>
        </div>
      </header>

      <section className="page-hero">
        <div className="page-wrapper">
          <div style={{maxWidth: '700px', margin: '0 auto'}}>
            <ClientLogin />
          </div>
        </div>
      </section>
    </main>
  );
}