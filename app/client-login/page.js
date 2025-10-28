// app/client-login/page.js
import ClientLogin from '../../components/ClientLogin';

export default function ClientLoginPage() {
  return (
    <main className="min-h-screen">
      <header className="site-header">
        <div className="page-wrapper header-row">
          <a href="/" className="brand">KaamConnect</a>
          <nav className="site-nav">
            <a href="/client-signup">Client Sign up</a>
            <a href="/search">Search</a>
          </nav>
        </div>
      </header>

      <section className="page-hero">
        <div className="page-wrapper">
          <div className="container-max">
            <ClientLogin />
          </div>
        </div>
      </section>
    </main>
  );
}