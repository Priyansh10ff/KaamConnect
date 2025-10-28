// app/api/worker/create/route.js
import { db, authAdmin } from '../../../../lib/firebaseAdmin'; 
import qrcode from 'qrcode';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // 1. Get Token
    const authorization = req.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }
    const token = authorization.split('Bearer ')[1];

    // 2. Verify Token
    const decodedToken = await authAdmin.verifyIdToken(token);
    const { uid, email } = decodedToken; 

    // 3. Get data from body (NOW INCLUDES 'location')
    const { name, trade, phone, location } = await req.json(); 
    if (!name || !trade || !phone || !location) { // <--- ADD 'location' TO CHECK
      return NextResponse.json({ error: 'Name, trade, phone, and location are required' }, { status: 400 });
    }

    // 4. Create worker ref
    const workerRef = db.collection('workers').doc(uid);
    
    // 5. Generate Profile URL
    const host = req.headers.get('host');
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const profileUrl = `${protocol}://${host}/w/${uid}`;
    
    // 6. Generate QR Code
    const qrUrl = await qrcode.toDataURL(profileUrl);

    // 7. Define data (NOW INCLUDES 'location')
    const workerData = {
      name,
      email, 
      phone, 
      trade,
      qrUrl, 
      trustScore: 0,
      jobsCount: 0,
      skills: [],
      location: location, // <--- ADD THIS
    };

    // 8. Save the data
    await workerRef.set(workerData);
    
    // 9. Send success response
    return NextResponse.json({ 
      message: 'Worker profile created', 
      workerId: uid, 
      qrUrl: qrUrl
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating worker:', error);
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json({ error: 'Unauthorized: Token expired' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}