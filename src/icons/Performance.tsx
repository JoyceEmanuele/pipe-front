type PerformanceIconProps = {
  color?: string;
}

export const PerformanceIcon = ({ color, ...props }: PerformanceIconProps): JSX.Element => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21 23H3C1.9 23 1 22.1 1 21V3C1 1.9 1.9 1 3 1H21C22.1 1 23 1.9 23 3V21C23 22.1 22.1 23 21 23ZM3.2 20.9H21V3.1H3.2V20.9Z"
      fill={color || '#5D5D5D'}
    />
    <path
      d="M14.8999 19.2H9.0999V14.9H4.8999V9.1H9.0999V4.8H14.8999V9.1H19.1999V14.8H14.8999V19.2ZM10.5999 17.7H13.3999V13.4H17.6999V10.7H13.3999V6.3H10.5999V10.6H6.3999V13.3H10.5999V17.7Z"
      fill={color || '#5D5D5D'}
    />
  </svg>
);
