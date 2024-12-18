export function OnIcon({ color }: { color?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="14"
      fill="none"
      viewBox="0 0 13 14"
    >
      <path
        stroke={color ?? '#363BC4'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
        d="M6.46 1.172V6.98m3.733-3.114a5.212 5.212 0 011.444 2.677 5.178 5.178 0 01-.3 3.02A5.24 5.24 0 019.39 11.91a5.32 5.32 0 01-5.868 0 5.24 5.24 0 01-1.945-2.346 5.179 5.179 0 01-.3-3.02 5.212 5.212 0 011.444-2.677"
      />
    </svg>
  );
}
