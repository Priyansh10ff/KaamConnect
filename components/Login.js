// components/Login.js
'use client';
import { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to dashboard on success
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Failed to log in. Check your email and password.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="card max-w-md mx-auto">
      <form onSubmit={handleLogin}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Sign in to your account</h2>
          <p className="muted mt-1">Access your worker dashboard and settings</p>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="form-row">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            required
            className="form-input"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="text-center muted mt-4">
        No account? <a href="/signup" className="text-indigo-600 font-semibold">Sign up</a>
      </p>
    </div>
  );
}