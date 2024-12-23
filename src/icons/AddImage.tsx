type AddImageIconProps = {
  color?: string;
}

export const AddImageIcon = ({ color, ...props }: AddImageIconProps): JSX.Element => (
  <svg {...props} width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16 19H2V5H11V3H2C0.9 3 0 3.9 0 5V19C0 20.1 0.9 21 2 21H16C17.1 21 18 20.1 18 19V10H16V19ZM8.21 15.83L6.25 13.47L3.5 17H14.5L10.96 12.29L8.21 15.83ZM18 3V0H16V3H13C13.01 3.01 13 5 13 5H16V7.99C16.01 8 18 7.99 18 7.99V5H21V3H18Z"
      fill={color}
      fillOpacity="0.7"
    />
  </svg>
);
