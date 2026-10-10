export function Emblem({ className = 'h-12 w-12', title = 'Municipal Emblem' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <circle cx="50" cy="50" r="48" fill="#0f2038" />
      <circle cx="50" cy="50" r="43" fill="none" stroke="#ff9933" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="39.5" fill="none" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="0.8" />
      {/* Temple / monument */}
      <path d="M36 44 L50 29 L64 44 Z" fill="#ffffff" />
      <rect x="39" y="44" width="22" height="16" fill="#ffffff" />
      <rect x="34" y="60" width="32" height="6" rx="1" fill="#ffdba8" />
      <rect x="46.5" y="48" width="7" height="12" rx="1" fill="#0f2038" />
      <circle cx="50" cy="25.5" r="2.4" fill="#ff9933" />
      <rect x="49.2" y="21.5" width="1.6" height="3.5" fill="#ff9933" />
      {/* Yamuna waves */}
      <path d="M30 71 Q37 67 44 71 T58 71 T70 71" fill="none" stroke="#138808" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M32 77 Q39 73 46 77 T60 77 T68 77" fill="none" stroke="#ff9933" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.9" />
    </svg>
  );
}

export default Emblem;
