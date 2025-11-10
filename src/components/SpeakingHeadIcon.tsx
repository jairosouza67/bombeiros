export function SpeakingHeadIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Coffee cup body */}
      <path d="M5 6h12c1.1 0 2 .9 2 2v7c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2z" />
      
      {/* Cup handle */}
      <path d="M17 9v5c0 .5.4 1 1 1 1 0 1.5-.5 1.5-1.5V9.5c0-1-.5-1.5-1.5-1.5-.6 0-1 .4-1 1z" />
      
      {/* Coffee inside - slight curve */}
      <path d="M6 10h10" />
      
      {/* Steam wisps */}
      <path d="M8 4c0-1 .5-1.5 1-1.5s1 .5 1 1.5" />
      <path d="M12 3c0-1.5.5-2 1-2s1 .5 1 2" />
      <path d="M16 4c0-1 .5-1.5 1-1.5s1 .5 1 1.5" />
    </svg>
  );
}
