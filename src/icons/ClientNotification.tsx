type ClientNotificationIconProps = {
  width?: string;
  height?: string;
}

export const ClientNotificationIcon = ({ width, height }: ClientNotificationIconProps): JSX.Element => (
  <svg width={width || '10'} height={height || '11'} viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 10C9 9.30222 9 8.95333 8.91388 8.66943C8.71998 8.03023 8.21977 7.53002 7.58057 7.33612C7.29667 7.25 6.94778 7.25 6.25 7.25H3.75C3.05222 7.25 2.70333 7.25 2.41943 7.33612C1.78023 7.53002 1.28002 8.03023 1.08612 8.66943C1 8.95333 1 9.30222 1 10M7.25 3.25C7.25 4.49264 6.24264 5.5 5 5.5C3.75736 5.5 2.75 4.49264 2.75 3.25C2.75 2.00736 3.75736 1 5 1C6.24264 1 7.25 2.00736 7.25 3.25Z" stroke="#363BC4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
