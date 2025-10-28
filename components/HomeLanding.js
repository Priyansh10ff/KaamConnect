"use client";
import Link from 'next/link';
import Silk from './Silk';
import React from 'react';

export default function HomeLanding() {
  return (
    <main className="full-viewport">
      {/* Silk background */}
      <div className="absolute-inset">
        <Silk speed={5} scale={1} color="#7B7481" noiseIntensity={1.5} rotation={0} />
      </div>

      {/* Overlay content */}
      <div className="overlay-center">
        <div className="overlay-inner">
          <h1 className="hero-title">KaamConnect</h1>
          <p className="hero-sub">Find trusted local workers near you</p>

          <div className="cta-row">
            <Link href="/login" className="btn-dark">Worker Login</Link>
            <Link href="/client-login" className="btn-light">Client Login</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
