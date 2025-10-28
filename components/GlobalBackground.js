"use client";
import React from 'react';
import Silk from './Silk';

export default function GlobalBackground() {
  return (
    <div aria-hidden className="fixed-full-bg">
      <Silk speed={5} scale={1} color="#7B7481" noiseIntensity={1.5} rotation={0} />
    </div>
  );
}