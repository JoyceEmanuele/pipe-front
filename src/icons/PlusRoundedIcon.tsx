type PlusRoundedIconProps = {
  color?: string;
}

export const PlusRoundedIcon = ({ color = '#363BC4', ...props }: PlusRoundedIconProps): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="34"
    height="34"
    viewBox="0 0 34 34"
    fill="none"
    {...props}
  >
    <g clipPath="url(#clip0_563_2723)">
      <path
        d="M21.2133 16.9705H12.7281M16.9707 12.7279V21.2131M24.0418 24.0416C20.1365 27.9468 13.8049 27.9468 9.89964 24.0416C5.99439 20.1363 5.99439 13.8047 9.89964 9.89944C13.8049 5.99419 20.1365 5.99419 24.0418 9.89944C27.947 13.8047 27.947 20.1363 24.0418 24.0416Z"
        stroke="#363BC4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_563_2723">
        <rect
          width="24"
          height="24"
          fill="white"
          transform="translate(16.9707) rotate(45)"
        />
      </clipPath>
    </defs>
  </svg>
);
