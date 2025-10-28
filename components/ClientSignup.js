// components/ClientSignup.js
'use client';
import { useState } from 'react';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function ClientSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Get the ID Token
      const token = await user.getIdToken();

      // 3. Send to a NEW API route to create a 'client' profile
      const res = await fetch('/api/client/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create client profile');
      }

      setSuccess('Account created! You can now log in.');
      // You could redirect to a client login or the homepage
      // window.location.href = '/client-login';

    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use.');
      } else {
        setError(err.message);
      }
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="card max-w-md mx-auto">
      <form onSubmit={handleSignup}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Create Client Account</h2>
          <p className="muted mt-1">Create an account to hire trusted workers nearby</p>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        <div className="form-row">
          <label htmlFor="name" className="form-label">Your Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Priya Sharma"
            required
            className="form-input"
          />
        </div>

        <div className="form-row">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g., priya@gmail.com"
            required
            className="form-input"
          />
        </div>

        <div className="form-row">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            className="form-input"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? 'Creating Account...' : 'Sign Up as Client'}
        </button>
      </form>

      <p className="text-center muted mt-4">
        Already a client? <a href="/client-login" className="text-indigo-600 font-semibold">Login</a>
      </p>
      <p className="text-center muted mt-2">
        Are you a worker? <a href="/signup" className="text-indigo-600 font-semibold">Sign up here</a>
      </p>
    </div>
  );
}