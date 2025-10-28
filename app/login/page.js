// app/login/page.js
import Login from '../../components/Login';

export default function LoginPage() {
  return (
    <main className="min-h-screen">
  <header className="site-header site-header--dark">
        <div className="page-wrapper header-row">
          <a href="/" className="brand">KaamConnect</a>
          <nav className="site-nav">
            <a href="/signup">Worker Sign up</a>
            <a href="/dashboard">Dashboard</a>
          </nav>
        </div>
      </header>

      <section className="page-hero">
        <div className="page-wrapper">
          <div className="container-max">
            <Login />
          </div>
        </div>
      </section>
    </main>
  );
}