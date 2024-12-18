type LineIconProps = {
  color?: string;
};

export const LineIcon = ({ color = '#000', ...props }: LineIconProps): JSX.Element => (
  <svg {...props} width="36" height="4" viewBox="0 0 36 4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2H34" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const DashedLineIcon = ({ color = '#000', ...props }: LineIconProps) : JSX.Element => (
  <svg {...props} width="35" height="4" viewBox="0 0 35 4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2H33" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray="5 5" />
  </svg>
);
