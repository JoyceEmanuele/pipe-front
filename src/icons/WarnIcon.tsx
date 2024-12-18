type WarnIconProps = {
  color?: string;
  width?: string;
  height?: string;
};

export const WarnIcon = ({
  color = '#F3B107', width = '15', height = '13', ...props
}: WarnIconProps): JSX.Element => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 15 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M7.265 4.97025V7.41193M7.265 9.85361H7.2711M6.41976 1.85206L1.39913 10.5241C1.12065 11.0051 0.981414 11.2456 1.00199 11.443C1.01994 11.6151 1.11014 11.7716 1.25015 11.8734C1.41066 11.9901 1.68856 11.9901 2.24437 11.9901H12.2856C12.8414 11.9901 13.1193 11.9901 13.2799 11.8734C13.4199 11.7716 13.5101 11.6151 13.528 11.443C13.5486 11.2456 13.4093 11.0051 13.1309 10.5241L8.11024 1.85206C7.83276 1.37278 7.69402 1.13314 7.51301 1.05265C7.35512 0.982448 7.17488 0.982448 7.01699 1.05265C6.83598 1.13314 6.69724 1.37278 6.41976 1.85206Z"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
