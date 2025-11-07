export function CoffeeCupIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      {/* Cup body */}
      <path d="M4 7h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
      {/* Handle */}
      <path d="M18 9v6c0 .6.4 1 1 1 1.3 0 2-1 2-2.5V10.5C21 9 20.3 8 19 8c-.6 0-1 .4-1 1z" />
      {/* Base/plate */}
      <path d="M3 19h14" />
      {/* Steam */}
      <path d="M7 4c0-1 .5-1.5 1-1.5S9 3 9 4" />
      <path d="M11 3c0-1.5.5-2 1-2s1 .5 1 2" />
      <path d="M15 4c0-1 .5-1.5 1-1.5S17 3 17 4" />
    </svg>
  );
}
