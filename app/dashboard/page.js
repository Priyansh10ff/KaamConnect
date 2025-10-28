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
      <main className="flex min-h-screen flex-col items-center p-12 bg-gray-50">
        <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Your Dashboard</h1>
            <button
              onClick={handleLogout}
              className="py-2 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl">Welcome, {worker.name}!</h2>
            <p className="text-gray-600">Your trade: {worker.trade}</p>
            <p className="text-gray-600">Your phone: {worker.phone}</p>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-4">Your HunarScan QR Code</h3>
            <p className="mb-4">Clients can scan this to leave you a review.</p>

            {/* Display the QR code image from the Data URL */}
            <img 
              src={worker.qrUrl} 
              alt="Your QR Code"
              className="mx-auto border-4 border-gray-300 rounded-lg"
              width={256}
              height={256}
            />

            <a
              href={worker.qrUrl} // The Data URL can be used as the download link
              download="hunarscan-qr.png" // This tells the browser to download it
              className="mt-6 inline-block py-3 px-6 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700"
            >
              Download Your QR
            </a>
          </div>
        </div>
      </main>
    );
  }

  // Default return (shouldn't be reached often)
  return null;
}