"use client";
import Link from 'next/link';
import Silk from './Silk';
import React from 'react';

export default function HomeLanding() {
  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Silk background */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Silk speed={5} scale={1} color="#7B7481" noiseIntensity={1.5} rotation={0} />
      </div>

      {/* Overlay content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        <div style={{ pointerEvents: 'auto', textAlign: 'center', color: 'white' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', marginBottom: '0.5rem' }}>KaamConnect</h1>
          <p style={{ marginBottom: '1.5rem', opacity: 0.95 }}>Find trusted local workers near you</p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link
              href="/login"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.25rem',
                borderRadius: 8,
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Worker Login
            </Link>

            <Link
              href="/client-login"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.25rem',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.9)',
                color: '#111827',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Client Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
