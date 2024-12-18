type SwitchIconProps = {
}

export const SwitchIcon = ({ ...props }: SwitchIconProps): JSX.Element => (
  <svg {...props} width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0H8V10H10V0ZM14.83 2.17L13.41 3.59C14.99 4.86 16 6.81 16 9C16 12.87 12.87 16 9 16C5.13 16 2 12.87 2 9C2 6.81 3.01 4.86 4.58 3.58L3.17 2.17C1.23 3.82 0 6.26 0 9C0 13.97 4.03 18 9 18C13.97 18 18 13.97 18 9C18 6.26 16.77 3.82 14.83 2.17Z"
      fill="#5D5D5D"
    />
  </svg>
);