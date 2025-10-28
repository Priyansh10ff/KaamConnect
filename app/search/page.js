// app/search/page.js
'use client';
import { useState, useEffect, useMemo } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

export default function SearchPage() {
  const [clientUser, setClientUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [allWorkers, setAllWorkers] = useState([]);
  const [fetchError, setFetchError] = useState('');

  // State for the search filters
  const [searchTrade, setSearchTrade] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  // 1. Check for authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setClientUser(user);
        
        // 2. Fetch all workers *after* we know user is logged in
        const fetchWorkers = async () => {
          try {
            const workersCollectionRef = collection(db, 'workers');
            const snapshot = await getDocs(workersCollectionRef);
            
            if (snapshot.empty) {
              setFetchError('No workers found.');
            } else {
              const workerList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              setAllWorkers(workerList);
            }
          } catch (err) {
            console.error(err);
            setFetchError('Failed to fetch workers.');
          }
          setLoading(false);
        };
        
        fetchWorkers();
        
      } else {
        // User is signed out, redirect to client login
        window.location.href = '/client-login';
      }
    });
    return () => unsubscribe();
  }, []);

  // 3. Filter the workers based on search state
  const filteredWorkers = useMemo(() => {
    return allWorkers.filter(worker => {
      const tradeMatch = worker.trade.toLowerCase().includes(searchTrade.toLowerCase());
      const locationMatch = worker.location.toLowerCase().includes(searchLocation.toLowerCase());
      return tradeMatch && locationMatch;
    });
  }, [allWorkers, searchTrade, searchLocation]);

  const handleLogout = async () => {
    await signOut(auth);
    // onAuthStateChanged will catch this and redirect
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><p>Loading search...</p></div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Find a Worker</h1>
          <button
            onClick={handleLogout}
            className="py-2 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        <p className="mb-6 text-gray-600">You are logged in as: {clientUser?.email}</p>

        {/* Search Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-6 bg-white rounded-lg shadow">
          <div>
            <label htmlFor="searchTrade" className="block text-sm font-medium text-gray-700">Filter by Trade</label>
            <input
              type="text"
              id="searchTrade"
              value={searchTrade}
              onChange={(e) => setSearchTrade(e.target.value)}
              placeholder="e.g., Electrician, Carpenter"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="searchLocation" className="block text-sm font-medium text-gray-700">Filter by Location</label>
            <input
              type="text"
              id="searchLocation"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="e.g., Delhi, 110034"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>

        {/* Worker List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fetchError && <p className="text-red-500">{fetchError}</p>}
          
          {filteredWorkers.length === 0 && !fetchError && (
            <p className="text-gray-500">No workers match your search.</p>
          )}

          {filteredWorkers.map(worker => (
            <div key={worker.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-2xl font-bold">{worker.name}</h2>
              <p className="text-lg text-gray-700 mb-2">{worker.trade}</p>
              <p className="text-sm text-gray-500 mb-4">{worker.location}</p>
              
              <div className="mb-4">
                <span className="text-xl font-bold text-blue-600">
                  {(worker.trustScore || 0).toFixed(1)}
                </span>
                <span className="text-gray-500"> Trust Score</span>
              </div>
              
              <a 
                href={`/w/${worker.id}`}
                target="_blank" // Open in new tab
                rel="noopener noreferrer"
                className="w-full text-center inline-block py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
              >
                View Profile & Reviews
              </a>
              {/* The "Book Now" button would go here */}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}