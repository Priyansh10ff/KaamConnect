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

  // Core data state
  const [worker, setWorker] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  // Review form state
  const [clientUser, setClientUser] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

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
      
      // Filter out duplicate reviews based on clientId and timestamp
      const seenReviews = new Set();
      const jobsList = jobsSnap.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(job => {
          // Create a unique key for each review using clientId and timestamp
          const reviewKey = `${job.clientId}-${job.timestamp?.seconds || Date.now()}`;
          if (seenReviews.has(reviewKey)) {
            return false; // Skip duplicate
          }
          seenReviews.add(reviewKey);
          return true;
        })
        // Sort by timestamp, newest first
        .sort((a, b) => {
          const timeA = a.timestamp?.seconds || 0;
          const timeB = b.timestamp?.seconds || 0;
          return timeB - timeA;
        });
        
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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!clientUser) {
      setSubmitError('You must be logged in as a client to leave a review.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    
    try {
      const token = await clientUser.getIdToken();
      
      const response = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          workerId: uid,
          rating: Number(rating),
          review: reviewText
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit review');
      }

      // Success handling
      setSubmitSuccess('Thank you! Your review has been posted successfully.');
      setReviewText('');
      setRating(5);

      // Refresh the data to show the new review
      await fetchData();

    } catch (err) {
      console.error('Submit review error:', err);
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
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

  // Removed duplicate ReviewForm component as we have the form logic in the main render

  return (
    <main className="min-h-screen p-8">
      <header className="site-header">
        <div className="page-wrapper header-row">
          <a href="/" className="brand">KaamConnect</a>
          <nav className="site-nav">
            <a href="/search">Search</a>
            {!clientUser ? (
              <>
                <a href="/client-login">Client Login</a>
                <a href="/client-signup">Client Signup</a>
              </>
            ) : (
              <span className="muted">Welcome, {clientUser.email}</span>
            )}
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

        {/* Review Form Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Share Your Feedback</h2>
          
          {!clientUser ? (
            // Not logged in state
            <div className="text-center py-4">
              <p className="text-gray-600 mb-6">Please log in or sign up as a client to leave a review</p>
              <div className="flex gap-4">
                <a href="/client-login" className="flex-1">
                  <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                    Client Login
                  </button>
                </a>
                <a href="/client-signup" className="flex-1">
                  <button className="w-full border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                    Client Sign Up
                  </button>
                </a>
              </div>
            </div>
          ) : submitSuccess ? (
            // Success state
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md">
              {submitSuccess}
            </div>
          ) : (
            // Review form
            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating
                </label>
                <select
                  value={rating}
                  onChange={e => setRating(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                  <option value="4">⭐⭐⭐⭐ Very Good</option>
                  <option value="3">⭐⭐⭐ Good</option>
                  <option value="2">⭐⭐ Fair</option>
                  <option value="1">⭐ Needs Improvement</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  rows="4"
                  placeholder="Share details about your experience working with this professional..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none"
                />
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>

              <p className="text-sm text-gray-500 text-center">
                Posting as {clientUser.email}
              </p>
            </form>
          )}
        </div>

        {/* Reviews List */}
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
                    - {job.clientEmail}
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