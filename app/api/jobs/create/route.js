import { auth as adminAuth } from '../../../../lib/firebaseAdmin';
import { db } from '../../../../lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Get the token
    const token = authHeader.split('Bearer ')[1];
    
    // Verify token and get user data
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Get request body
    const data = await req.json();
    const { workerId, rating, review } = data;

    // Get user claims and email
    const userRecord = await adminAuth.getUser(decodedToken.uid);
    const customClaims = userRecord.customClaims || {};
    const email = userRecord.email;
    
    // For now, let's consider any authenticated user as a client
    // Later we can add proper role-based checks using custom claims
    const jobRef = collection(db, 'workers', workerId, 'jobs');
    await addDoc(jobRef, {
      clientId: decodedToken.uid,
      clientEmail: email,
      rating,
      review,
      timestamp: Timestamp.now()
    });

    if (!workerId) {
      return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 });
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Create the review document in the jobs subcollection
    const jobsRef = collection(db, 'workers', workerId, 'jobs');
    await addDoc(jobsRef, {
      clientId: decodedToken.uid,
      clientEmail: decodedToken.email,
      rating: Number(rating),
      review: review || '',
      createdAt: Timestamp.now()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }

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
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Rating (1-5 Stars)</label>
            <select id="rating" value={rating} onChange={(e) => setRating(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
              <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
              <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
              <option value={3}>⭐⭐⭐ 3 Stars</option>
              <option value={2}>⭐⭐ 2 Stars</option>
              <option value={1}>⭐ 1 Star</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="review" className="block text-sm font-medium text-gray-700">Review (Optional)</label>
            <textarea id="review" rows={3} value={review} onChange={(e) => setReview(e.target.value)} placeholder="e.g., Sunil did a great job..." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          {formError && <p className="text-red-500 text-sm mb-2">{formError}</p>}
          {formSuccess && <p className="text-green-600 text-sm mb-2">{formSuccess}</p>}
          <button type="submit" disabled={formLoading} className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400">
            {formLoading ? 'Submitting...' : 'Submit Review'}
          </button>
          <p className="text-xs text-center text-gray-500 mt-2">Logged in as {clientUser.email}</p>
        </form>
      );
    }

    // Client is NOT logged in, show login links
    return (
      <div className="text-center">
        <p className="font-semibold text-lg mb-4">Want to leave a review?</p>
        <p className="mb-4">Please log in or sign up as a client to share your feedback.</p>
        <div className="flex gap-4">
          <a href="/client-login" className="flex-1 py-3 px-4 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 text-center">
            Client Login
          </a>
          <a href="/client-signup" className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 text-center">
            Client Sign Up
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-md">
        
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
    </main>
  );
}