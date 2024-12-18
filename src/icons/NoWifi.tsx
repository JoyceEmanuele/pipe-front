export function NoWifi({ width, height }: { width?: string, height?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '15'}
      height={height || '13'}
      fill="none"
      viewBox="0 0 15 13"
    >
      <path
        stroke="#BEBDBD"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
        d="M9.236 5.083a6.417 6.417 0 012.198 1.196m2.042-2.07a9.333 9.333 0 00-7.224-2.273m-.972 6.42a3.5 3.5 0 014.054 0m-2.03 2.269h.006M1 4.325a9.341 9.341 0 012.663-1.713m-.599 3.78a6.397 6.397 0 012.917-1.464m3.48 3.524a3.485 3.485 0 00-2.157-.744c-.826 0-1.586.287-2.184.765M2.054 1l10.5 10.5"
      />
    </svg>
  );
}
