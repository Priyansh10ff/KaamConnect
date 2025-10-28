// app/client-signup/page.js
import ClientSignup from '../../components/ClientSignup';

export default function ClientSignupPage() {
  return (
    <main className="min-h-screen">
      <header className="site-header">
        <div className="page-wrapper header-row">
          <a href="/" className="brand">KaamConnect</a>
          <nav className="site-nav">
            <a href="/client-login">Client Login</a>
            <a href="/search">Search</a>
          </nav>
        </div>
      </header>

      <section className="page-hero">
        <div className="page-wrapper">
          <div className="container-max">
            <ClientSignup />
          </div>
        </div>
      </section>
    </main>
  );
}