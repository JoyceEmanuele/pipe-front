type HamburgerIconProps = {
  color?: string;
}

export const HamburgerIcon = ({ color, ...props }: HamburgerIconProps): JSX.Element => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path d="M0 0h24v24H0z" fill="none" />
    <path fill={color || '#5D5D5D'} d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
);
