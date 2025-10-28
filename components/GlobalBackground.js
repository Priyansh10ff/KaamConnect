"use client";
import React from 'react';
import Silk from './Silk';

export default function GlobalBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        width: '100%',
        height: '100%'
      }}
    >
      <Silk speed={5} scale={1} color="#7B7481" noiseIntensity={1.5} rotation={0} />
    </div>
  );
}