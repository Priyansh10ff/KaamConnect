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
    <main className="min-h-screen p-8">
      <div className="page-wrapper">

        <header className="site-header" style={{padding:0, marginBottom:'1rem'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <h1 className="text-3xl font-bold">Find a Worker</h1>
              <p className="muted">You are logged in as: {clientUser?.email}</p>
            </div>
            <div>
              <a href="/" className="muted">Home</a>
              <button onClick={handleLogout} className="btn btn-danger" style={{marginLeft:'10px'}}>Logout</button>
            </div>
          </div>
        </header>

        {/* Search Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-6 card">
          <div>
            <label htmlFor="searchTrade" className="block text-sm font-medium text-gray-700">Filter by Trade</label>
            <input
              type="text"
              id="searchTrade"
              value={searchTrade}
              onChange={(e) => setSearchTrade(e.target.value)}
              placeholder="e.g., Electrician, Carpenter"
              className="form-input"
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
              className="form-input"
            />
          </div>
        </div>
        {/* Worker List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fetchError && <p className="text-red-500">{fetchError}</p>}

          {filteredWorkers.length === 0 && !fetchError && (
            <p className="muted">No workers match your search.</p>
          )}

          {filteredWorkers.map(worker => (
            <div key={worker.id} className="card">
              <h2 className="text-2xl font-bold">{worker.name}</h2>
              <p className="text-lg muted mb-2">{worker.trade}</p>
              <p className="muted mb-4">{worker.location}</p>

              <div className="mb-4">
                <span className="text-xl font-bold" style={{color:'var(--primary)'}}>
                  {(worker.trustScore || 0).toFixed(1)}
                </span>
                <span className="muted"> Trust Score</span>
              </div>

              <a
                href={`/w/${worker.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{display:'inline-block'}}
              >
                View Profile & Reviews
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}