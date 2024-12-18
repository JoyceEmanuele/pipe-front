type ArrowLeftIconProps = {
  color?: string;
}

export const ArrowLeftIcon = ({ color = 'black', ...props }: ArrowLeftIconProps): JSX.Element => (
  <svg
    width="6"
    height="7"
    viewBox="0 0 6 7"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M0.500001 4.36603C-0.166666 3.98113  -0.166667 3.01887 0.5 2.63397L4.25 0.468913C4.91666 0.0840126 5.75 0.565137 5.75 1.33494L5.75 5.66507C5.75 6.43487 4.91667 6.91599 4.25 6.53109L0.500001 4.36603Z"
      fill={color}
    />
  </svg>
);
