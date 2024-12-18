type ArrowRightIconProps = {
  color?: string;
}

export const ArrowRightIcon = ({ color = '#B7B7B7', ...props }: ArrowRightIconProps): JSX.Element => (
  <svg
    width="6"
    height="7"
    viewBox="0 0 6 7"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M5.5 2.63397C6.16667 3.01887 6.16667 3.98113 5.5 4.36603L1.75 6.53109C1.08334 6.91599 0.250001 6.43486 0.250001 5.66506L0.250001 1.33493C0.250001 0.565134 1.08333 0.0840104 1.75 0.468911L5.5 2.63397Z"
      fill={color}
    />
  </svg>
);
