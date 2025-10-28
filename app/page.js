'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../lib/firebase';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Check if user is a client based on claims
        user.getIdTokenResult().then((idTokenResult) => {
          if (idTokenResult.claims.type === 'client') {
            router.push('/search'); // Clients go to search page
          } else {
            router.push('/dashboard'); // Workers go to dashboard
          }
        }).catch(() => {
          // If we can't check claims, default to dashboard
          router.push('/dashboard');
        });
      } else {
        // No user is signed in, redirect to login
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Show nicer loading spinner while checking auth
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
      <p className="text-gray-600">Loading your workspace...</p>
    </div>
  );
}