type WatchIconProps = {
  color?: string;
}

export const WatchIcon = ({ color = '#878787' }: WatchIconProps): JSX.Element => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 29C22.732 29 29 22.732 29 15C29 7.26801 22.732 1 15 1C7.26801 1 1 7.26801 1 15C1 22.732 7.26801 29 15 29Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 7V15L19 19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
