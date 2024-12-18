type CheckIconProps = {
  color?: string;
}

export const CheckIcon = ({ color = '#5AB365', ...props }: CheckIconProps): JSX.Element => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 17 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.31234 8.50002L7.43734 10.625L11.6873 6.37502M15.5832 8.50002C15.5832 12.412 12.4119 15.5834 8.49984 15.5834C4.58782 15.5834 1.4165 12.412 1.4165 8.50002C1.4165 4.588 4.58782 1.41669 8.49984 1.41669C12.4119 1.41669 15.5832 4.588 15.5832 8.50002Z"
      stroke="#5AB365"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
