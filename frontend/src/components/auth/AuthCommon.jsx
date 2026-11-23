import React from 'react';

// Authentic Google Multicolor SVG Icon
export const GoogleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

// Top-Right Accent Sparkles / Burst Marks matching Mockup
export const SparklesAccent = ({ className = "text-indigo-500" }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    className={className}
  >
    <line x1="12" y1="2" x2="12" y2="7" />
    <line x1="4.5" y1="5.5" x2="8" y2="9" />
    <line x1="19.5" y1="5.5" x2="16" y2="9" />
  </svg>
);

// Delicate Campus & City Outline Vector Skyline matching Mockup Bottom Edge
export const SkylineDecoration = ({ className = "w-full text-indigo-300/40" }) => (
  <div className="w-full overflow-hidden select-none pointer-events-none mt-2">
    <svg
      viewBox="0 0 500 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
    >
      <path
        d="M0 35 H500 M8 35 V22 H24 V35 M28 35 V14 H48 V35 M54 35 V26 H68 V35 M74 35 V17 H92 V35 M98 35 V11 H106 L110 5 L114 11 H122 V35 M128 35 V23 H142 V35 M148 35 V13 H170 V35 M176 35 V20 H192 V35 M198 35 V9 H208 L212 3 L216 9 H226 V35 M234 35 V22 H248 V35 M254 35 V15 H272 V35 M278 35 V24 H292 V35 M298 35 V11 H318 V35 M324 35 V22 H338 V35 M344 35 V14 H360 V35 M366 35 V25 H380 V35 M386 35 V16 H402 V35 M408 35 V8 H418 L422 3 L426 8 H436 V35 M442 35 V20 H458 V35 M464 35 V14 H482 V35 M488 35 V26 H498 V35"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tiny architectural windows */}
      <rect x="33" y="18" width="3" height="3" fill="currentColor" opacity="0.6" />
      <rect x="41" y="18" width="3" height="3" fill="currentColor" opacity="0.6" />
      <rect x="33" y="24" width="3" height="3" fill="currentColor" opacity="0.6" />
      <rect x="41" y="24" width="3" height="3" fill="currentColor" opacity="0.6" />
      <rect x="154" y="17" width="4" height="4" fill="currentColor" opacity="0.6" />
      <rect x="154" y="24" width="4" height="4" fill="currentColor" opacity="0.6" />
      <rect x="304" y="16" width="3" height="3" fill="currentColor" opacity="0.6" />
      <rect x="304" y="22" width="3" height="3" fill="currentColor" opacity="0.6" />
    </svg>
  </div>
);
