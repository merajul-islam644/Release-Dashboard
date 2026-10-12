export function LatticeLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 17 9 7h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 7h6l5 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="2" fill="currentColor" />
      <circle cx="15" cy="7" r="2" fill="currentColor" />
      <circle cx="20" cy="17" r="2" fill="currentColor" />
      <circle cx="4" cy="17" r="2" fill="currentColor" />
    </svg>
  );
}