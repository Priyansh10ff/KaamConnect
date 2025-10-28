import { db, auth as adminAuth, admin } from '../../../../lib/firebaseAdmin';
import { NextResponse } from 'next/server';

// POST /api/jobs/create
export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(token);

    const body = await req.json();
    const { workerId, rating, review } = body || {};

    if (!workerId) {
      return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 });
    }

    const r = Number(rating);
    if (!r || r < 1 || r > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Retrieve client info
    const userRecord = await adminAuth.getUser(decoded.uid).catch(() => null);
    const clientEmail = userRecord?.email || null;
    const clientName = userRecord?.displayName || null;

    // Use a transaction to create the review and update aggregated stats atomically
    await db.runTransaction(async (tx) => {
      const workerRef = db.collection('workers').doc(workerId);
      const statsRef = db.collection('workerStats').doc(workerId);
      const jobsCollectionRef = workerRef.collection('jobs');
      // Firestore requires that all reads occur before any writes inside a transaction.
      // Perform reads first.
      const [statsSnap, workerSnap] = await Promise.all([
        tx.get(statsRef),
        tx.get(workerRef)
      ]);

      // Compute updated stats
      let totalRatings = 0;
      let totalScore = 0;
      if (statsSnap.exists) {
        const s = statsSnap.data();
        totalRatings = s.totalRatings || 0;
        totalScore = s.totalScore || 0;
      }
      totalRatings += 1;
      totalScore += r;
      const averageRating = totalScore / totalRatings;

      const currentJobs = workerSnap.exists ? (workerSnap.data().jobsCount || 0) : 0;

      // Now perform writes
      const newJobRef = jobsCollectionRef.doc();
      tx.set(newJobRef, {
        clientId: decoded.uid,
        clientEmail,
        clientName,
        rating: r,
        review: review || '',
        timestamp: admin.firestore.Timestamp.now()
      });

      tx.set(statsRef, {
        totalRatings,
        totalScore,
        averageRating
      }, { merge: true });

      tx.set(workerRef, {
        trustScore: averageRating,
        jobsCount: currentJobs + 1
      }, { merge: true });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Review submission error:', err);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}