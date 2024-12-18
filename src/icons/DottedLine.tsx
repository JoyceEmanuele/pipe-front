type DottedLineIconProps = {
  color?: string;
}

export const DottedLineIcon = ({ color = '#000', ...props }: DottedLineIconProps): JSX.Element => (
  <svg {...props} width="36" height="4" viewBox="0 0 36 4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2 2H34"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="2 6 2 6"
    />
  </svg>
);
