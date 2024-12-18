type IconProps = {
  color?: string;
}

export const PausedIcon = ({ color = '#B1B1B1', ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={12}
    height={12}
    fill="none"
    {...props}
  >
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.75 7.5v-3m2.5 3v-3M11 6A5 5 0 1 1 1 6a5 5 0 0 1 10 0Z"
    />
  </svg>
);
