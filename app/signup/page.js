// app/signup/page.js
import Onboarding from '../../components/Onboarding'; // Import the component

export default function SignupPage() {
  return (
    <main className="min-h-screen">
      <header className="site-header">
        <div className="page-wrapper" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <a href="/" className="brand">KaamConnect</a>
          <nav className="site-nav">
            <a href="/login">Login</a>
            <a href="/dashboard">Dashboard</a>
          </nav>
        </div>
      </header>

      <section className="page-hero">
        <div className="page-wrapper">
          <div style={{maxWidth: '700px', margin: '0 auto'}}>
            <Onboarding />
          </div>
        </div>
      </section>
    </main>
  );
}