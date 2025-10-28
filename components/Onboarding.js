// components/Onboarding.js
'use client'; 

import { useState } from 'react';
import { auth } from '../lib/firebase'; 
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function Onboarding() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [trade, setTrade] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState(''); // <--- ADD THIS

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Get the ID Token
      const token = await user.getIdToken();

      // 3. Send token and ALL form data to our API route
      const res = await fetch('/api/worker/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, trade, phone, location }) // <--- ADD 'location' HERE
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create profile');
      }

      const data = await res.json();
      alert('Success! Your profile is created. Your ID: ' + data.workerId);
      
      window.location.href = '/dashboard';

    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please use another.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message);
      }
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="card card-lg max-w-md mx-auto">
      <form onSubmit={handleCreateAccount}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Create your worker profile</h2>
          <p className="muted mt-1">Join KaamConnect to get jobs and collect verified reviews</p>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="form-row">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g., sunil@gmail.com"
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

        <hr className="my-6" />

        <div className="form-row">
          <label htmlFor="name" className="form-label">Your Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Sunil Kumar"
            required
            className="form-input"
          />
        </div>

        <div className="form-row">
          <label htmlFor="trade" className="form-label">Your Trade</label>
          <input
            type="text"
            id="trade"
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            placeholder="e.g., Carpenter, Electrician"
            required
            className="form-input"
          />
        </div>

        <div className="form-row">
          <label htmlFor="phone" className="form-label">Your Phone Number</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g., 911234567890"
            required
            className="form-input"
          />
        </div>

        <div className="form-row">
          <label htmlFor="location" className="form-label">Location</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Delhi, India or 110034"
            required
            className="form-input"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? 'Creating Account...' : 'Create Account & Profile'}
        </button>
      </form>
    </div>
  );
}