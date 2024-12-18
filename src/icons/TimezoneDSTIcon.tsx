interface ITimezoneDST {
  color?: string,
  width?: string,
  height?: string
}

export const TimezoneDSTIcon = ({ color, width, height }: ITimezoneDST): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width ?? '15'}
    height={height ?? '15'}
    fill="none"
    viewBox="0 0 16 16"
  >
    <path
      stroke={color ?? '#8B8B8B'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.2"
      d="M7.75 1v1.35m0 10.8v1.35m-5.4-6.75H1m2.912-3.838l-.955-.955m8.631.955l.955-.955m-8.631 8.634l-.955.954m8.631-.954l.955.954M14.5 7.75h-1.35m-2.025 0a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z"
    />
  </svg>
);
