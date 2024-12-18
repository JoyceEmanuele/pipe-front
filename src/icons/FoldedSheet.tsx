type FoldedIconProps = {
  color?: string;
  width?: string;
}

export function FoldedSheet({ color, width }: FoldedIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height="20"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M11.667 1.891v3.442c0 .467 0 .7.09.879.08.156.208.284.365.364.178.09.411.09.878.09h3.442m-3.109 4.167H6.667m6.666 3.334H6.667M8.333 7.5H6.667m5-5.833H7.333c-1.4 0-2.1 0-2.635.272a2.5 2.5 0 00-1.092 1.093c-.273.534-.273 1.234-.273 2.635v8.666c0 1.4 0 2.1.273 2.635a2.5 2.5 0 001.092 1.093c.535.272 1.235.272 2.635.272h5.334c1.4 0 2.1 0 2.635-.272a2.5 2.5 0 001.092-1.093c.273-.535.273-1.235.273-2.635V6.667l-5-5z"
      />
    </svg>
  );
}

export default FoldedSheet;
