type ListIconProps = {
  color?: string;
};

export const ListIcon = ({ color }: ListIconProps): JSX.Element => (
  <svg width="40" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 12H11V10H7V12ZM0 0V2H18V0H0ZM3 7H15V5H3V7Z" fill={color || '#5D5D5D'} fillOpacity="0.7" />
  </svg>
);
