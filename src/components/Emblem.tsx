import React from 'react';

interface EmblemProps {
  className?: string;
}

export const UniversityEmblem: React.FC<EmblemProps> = ({ className = 'w-9 h-9' }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <circle cx="32" cy="32" r="30" fill="#0F2342" stroke="#C9972C" strokeWidth="2.5" />
    <circle cx="32" cy="32" r="24" stroke="#C9972C" strokeOpacity="0.45" strokeWidth="1" />
    <path
      d="M18 42V25L32 17L46 25V42"
      stroke="#F8FAFC"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M23 42V29M32 42V23M41 42V29"
      stroke="#C9972C"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M16 44H48" stroke="#C9972C" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="32" cy="14" r="2" fill="#C9972C" />
  </svg>
);
