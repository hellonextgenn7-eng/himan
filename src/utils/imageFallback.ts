import React from 'react';

export const FALLBACK_PHONE_IMAGE =
  'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80';

// Self-contained SVG smartphone render as ultimate zero-network fallback
export const FALLBACK_PHONE_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#FF6A00"/>
    </linearGradient>
  </defs>
  <rect width="400" height="500" rx="32" fill="url(#bg)"/>
  <rect x="105" y="40" width="190" height="420" rx="30" fill="#0f172a" stroke="#334155" stroke-width="6"/>
  <rect x="115" y="54" width="170" height="392" rx="22" fill="url(#screen)"/>
  <rect x="172" y="64" width="56" height="14" rx="7" fill="#020617"/>
  <circle cx="200" cy="230" r="36" fill="rgba(255,255,255,0.12)"/>
  <text x="200" y="236" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="16">Phone Bazar</text>
  <text x="200" y="264" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">Certified Pre-Owned</text>
  <rect x="165" y="428" width="70" height="5" rx="2.5" fill="rgba(255,255,255,0.5)"/>
</svg>`);

export function getSafeImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return FALLBACK_PHONE_IMAGE;
  }
  return url.trim();
}

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>): void {
  const target = e.currentTarget;
  if (target.dataset.fallbackStage === '1') {
    target.dataset.fallbackStage = '2';
    target.src = FALLBACK_PHONE_SVG;
  } else if (!target.dataset.fallbackStage) {
    target.dataset.fallbackStage = '1';
    target.src = FALLBACK_PHONE_IMAGE;
  }
}
