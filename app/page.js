'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../lib/firebase';
import HomeLanding from '../components/HomeLanding';

export default function RootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Check if user is a client based on claims
        user.getIdTokenResult().then((idTokenResult) => {
          if (idTokenResult.claims.type === 'client') {
            router.replace('/search'); // Clients go to search page
          } else {
            router.replace('/dashboard'); // Workers go to dashboard
          }
        }).catch(() => {
          // If we can't check claims, default to dashboard
          router.replace('/dashboard');
        });
      } else {
        // No user is signed in — show the public home landing
        setChecking(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-gray-600">Loading your workspace...</p>
      </div>
    );
  }

  // Unauthenticated users see the landing
  return <HomeLanding />;
}