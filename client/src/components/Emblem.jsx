export function Emblem({ className = 'h-12 w-12', title = 'Civic issue reporting emblem' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <circle cx="50" cy="50" r="48" fill="#0f2038" />
      <circle cx="50" cy="50" r="43" fill="none" stroke="#ff9933" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="39.5" fill="none" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="0.8" />

      {/* Location pin — "a civic problem at a place" */}
      <path
        d="M50 22 C38.95 22 30 30.95 30 42 C30 56 50 76 50 76 C50 76 70 56 70 42 C70 30.95 61.05 22 50 22 Z"
        fill="#ffffff"
      />

      {/* Warning / exclamation mark inside the pin */}
      <rect x="47.4" y="32" width="5.2" height="15" rx="2.6" fill="#0f2038" />
      <circle cx="50" cy="54" r="3.2" fill="#0f2038" />

      {/* Tricolor base (issue resolution / Yamuna waves) */}
      <path d="M30 85 Q37 81 44 85 T58 85 T70 85" fill="none" stroke="#ff9933" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M33.5 90 Q39.75 86.5 46 90 T60 90 T66.5 90" fill="none" stroke="#138808" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default Emblem;
