// app/client-signup/page.js
import ClientSignup from '../../components/ClientSignup'; // Import the new component

export default function ClientSignupPage() {
  return (
    <main className="min-h-screen">
      <header className="site-header">
        <div className="page-wrapper" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <a href="/" className="brand">KaamConnect</a>
          <nav className="site-nav">
            <a href="/client-login">Client Login</a>
            <a href="/search">Search</a>
          </nav>
        </div>
      </header>

      <section className="page-hero">
        <div className="page-wrapper">
          <div style={{maxWidth: '700px', margin: '0 auto'}}>
            <ClientSignup />
          </div>
        </div>
      </section>
    </main>
  );
}