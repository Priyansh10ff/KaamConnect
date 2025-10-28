// app/w/[uid]/page.js
'use client';
import { useState, useEffect } from 'react';
import { db, auth } from '../../../lib/firebase'; // <--- IMPORT 'auth'
import { onAuthStateChanged } from 'firebase/auth'; // <--- IMPORT AUTH LISTENER
import { doc, getDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { useParams } from 'next/navigation';

export default function PublicProfile() {
  const params = useParams();
  const uid = params.uid;

  const [worker, setWorker] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for the logged-in client
  const [clientUser, setClientUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Effect to check for logged-in client
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // A user is logged in.
        setClientUser(user);
      } else {
        setClientUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Function to fetch worker data
  const fetchData = async () => {
    if (!uid) {
      setError('No worker ID found.');
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch worker data
      const workerRef = doc(db, 'workers', uid);
      const docSnap = await getDoc(workerRef);

      if (docSnap.exists()) {
        setWorker(docSnap.data());
      } else {
        setError('Worker not found.');
      }

      // 2. Fetch jobs sub-collection
      const jobsRef = collection(db, 'workers', uid, 'jobs');
      const jobsSnap = await getDocs(jobsRef);
      const jobsList = jobsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(jobsList);

    } catch (err) {
      setError('Failed to fetch data.');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [uid]);

  // Handle the review form submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    // Check if client is logged in before submitting
    if (!clientUser) {
      setFormError('You must be logged in as a client to leave a review.');
      return;
    }

    setFormLoading(true);
    setFormError('');
    setFormSuccess('');

    try {
      // Get the client's auth token
      const token = await clientUser.getIdToken();

      const res = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Send the client's token
        },
        body: JSON.stringify({
          workerId: uid, 
          rating: Number(rating),
          review: review,
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit review.');
      }

      setFormSuccess('Thank you! Your review has been submitted.');
      setReview('');
      setRating(5);
      fetchData(); // Refresh the data to show the new review

    } catch (err) {
      setFormError(err.message);
      console.error(err);
    }
    setFormLoading(false);
  };

  // --- Render States ---

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><p>Loading profile...</p></div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-red-500">{error}</p></div>;
  }

  if (!worker) {
    return <div className="flex min-h-screen items-center justify-center"><p>Worker not found.</p></div>;
  }

  // This is the conditional component for the Review Form
  const ReviewForm = () => {
    if (authLoading) {
      return <div className="text-center p-4"><p>Loading review form...</p></div>
    }
    
  if (clientUser) {
      // Client is logged in, show the form
      return (
        <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
            <label htmlFor="rating" className="form-label">Rating (1-5 Stars)</label>
            <select id="rating" value={rating} onChange={(e) => setRating(e.target.value)} className="form-input">
              <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
              <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
              <option value={3}>⭐⭐⭐ 3 Stars</option>
              <option value={2}>⭐⭐ 2 Stars</option>
              <option value={1}>⭐ 1 Star</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="review" className="form-label">Review (Optional)</label>
            <textarea id="review" rows={3} value={review} onChange={(e) => setReview(e.target.value)} placeholder="e.g., Sunil did a great job..." className="form-input form-textarea" />
          </div>
          {formError && <p className="text-red-500 text-sm mb-2">{formError}</p>}
          {formSuccess && <p className="text-green-600 text-sm mb-2">{formSuccess}</p>}
          <button type="submit" disabled={formLoading} className="btn btn-primary w-full">
            {formLoading ? 'Submitting...' : 'Submit Review'}
          </button>
          <p className="text-xs muted text-center mt-2">Logged in as {clientUser.email}</p>
        </form>
      );
    }

    // Client is NOT logged in, show login links
    return (
      <div className="text-center">
        <p className="font-semibold text-lg mb-4">Want to leave a review?</p>
        <p className="mb-4">Please log in or sign up as a client to share your feedback.</p>
        <div style={{display:'flex', gap:'0.75rem'}}>
          <a href="/client-login" className="btn btn-primary" style={{flex:1, textAlign:'center'}}>
            Client Login
          </a>
          <a href="/client-signup" className="btn btn-ghost" style={{flex:1, textAlign:'center'}}>
            Client Sign Up
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <header className="site-header">
        <div className="page-wrapper" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <a href="/" className="brand">KaamConnect</a>
          <nav className="site-nav">
            <a href="/search">Search</a>
            <a href="/client-login">Client Login</a>
          </nav>
        </div>
      </header>

      <div className="page-wrapper">
        <div className="card card-lg w-full max-w-3xl mx-auto">
        
        {/* Worker Info (Unchanged) */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">{worker.name}</h1>
          <p className="text-xl text-gray-700">{worker.trade}</p>
          <div className="mt-4">
            <p className="text-3xl font-bold text-blue-600">
              {/* Use worker.trustScore or 0 if it doesn't exist yet */}
              {(worker.trustScore || 0).toFixed(1)} Trust Score
            </p>
            <p className="text-gray-500">from {worker.jobsCount || 0} verified job(s)</p>
          </div>
        </div>

        {/* New Review Form (Now conditional) */}
        <div className="bg-blue-50 p-6 rounded-lg mb-10 border border-blue-200">
          <h2 className="text-2xl font-semibold mb-4 text-center">Leave a Review</h2>
          <ReviewForm /> {/* <--- Use the new conditional component */}
        </div>

        {/* Past Reviews (With Client Name) */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Verified Jobs & Reviews</h2>
          {jobs.length === 0 ? (
            <p className="text-gray-500">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-6">
              {jobs.map(job => (
                <div key={job.id} className="border p-4 rounded-lg bg-gray-50">
                  <p className="text-lg font-semibold">
                    Rating: <span className="text-yellow-500">{'⭐'.repeat(job.rating)}</span>
                  </p>
                  <p className="text-gray-700 mt-2">"{job.review}"</p>
                  {/* This is the new line you just added */}
                  <p className="text-sm text-gray-600 mt-2 font-medium">
                    - {job.clientName}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {job.timestamp ? new Date(job.timestamp.seconds * 1000).toLocaleDateString() : 'Just now'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        </div>
      </div>
    </main>
  );
}