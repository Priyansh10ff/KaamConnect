// app/api/client/create/route.js
import { db, auth } from '../../../../lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // 1. Get Token from Authorization header
    const authorization = req.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }
    const token = authorization.split('Bearer ')[1];

    // 2. Verify Token
    const decodedToken = await authAdmin.verifyIdToken(token);
    const { uid, email } = decodedToken;

    // 3. Get name from request body
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // 4. Create a document in a NEW 'clients' collection
    const clientRef = db.collection('clients').doc(uid);

    const clientData = {
      name,
      email,
      createdAt: new Date(),
      // We can store an array of reviews they've given
      reviewsGiven: [] 
    };

    // 5. Set the document data
    await clientRef.set(clientData);

    // 6. Send success response
    return NextResponse.json({ 
      message: 'Client profile created', 
      clientId: uid 
    }, { status: 201 });

  } catch (error) { // <--- THIS BRACE WAS MISSING
    console.error('Error creating client:', error);
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json({ error: 'Unauthorized: Token expired' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}