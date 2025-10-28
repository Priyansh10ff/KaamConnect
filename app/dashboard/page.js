// app/dashboard/page.js
'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '../../lib/firebase'; // Get auth and client-side db
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Dashboard() {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        try {
          // 1. Get the worker's document from Firestore
          const workerRef = doc(db, 'workers', user.uid);
          const docSnap = await getDoc(workerRef);

          if (docSnap.exists()) {
            // 2. Set the worker data
            setWorker(docSnap.data());
          } else {
            setError('No profile data found for this user.');
          }
        } catch (err) {
          setError('Failed to fetch profile data.');
          console.error(err);
        }
      } else {
        // User is signed out, redirect to login
        window.location.href = '/login';
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged will catch this and redirect
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
        <a href="/login" className="ml-4 text-blue-600">Go to Login</a>
      </div>
    );
  }

  // Show dashboard
    if (worker) {
    return (
      <main className="min-h-screen p-6">
        <header className="site-header">
          <div className="page-wrapper" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <a href="/" className="brand">KaamConnect</a>
            <nav className="site-nav">
              <a href="/">Home</a>
              <button onClick={handleLogout} className="btn btn-danger" style={{marginLeft:'8px'}}>Logout</button>
            </nav>
          </div>
        </header>

        <section className="page-hero">
          <div className="page-wrapper">
            <div className="card card-lg w-full max-w-3xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">Your Dashboard</h1>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl">Welcome, {worker.name}!</h2>
                <p className="muted">Your trade: {worker.trade}</p>
                <p className="muted">Your phone: {worker.phone}</p>
              </div>

              <div className="card" style={{background:'#f8fafc', textAlign:'center'}}>
                <h3 className="text-xl font-semibold mb-4">Your HunarScan QR Code</h3>
                <p className="muted mb-4">Clients can scan this to leave you a review.</p>

                <img
                  src={worker.qrUrl}
                  alt="Your QR Code"
                  className="mx-auto"
                  width={256}
                  height={256}
                />

                <a
                  href={worker.qrUrl}
                  download="hunarscan-qr.png"
                  className="btn btn-primary"
                  style={{display:'inline-block', marginTop:'1rem'}}
                >
                  Download Your QR
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Default return (shouldn't be reached often)
  return null;
}