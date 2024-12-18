type EletricalNetworkIconProps = {
  color?: string;
}

export const EletricNetworkIcon = ({ color = '#363BC4', ...props }: EletricalNetworkIconProps): JSX.Element => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.5 3.625L5.02119 8.68508C4.81177 8.9897 4.70706 9.14201 4.71335 9.26861C4.71883 9.37887 4.77261 9.48111 4.86037 9.54809C4.96113 9.625 5.14596 9.625 5.51562 9.625H8.5V13.375L11.9788 8.31492C12.1882 8.0103 12.2929 7.85799 12.2867 7.73139C12.2812 7.62113 12.2274 7.51889 12.1396 7.45191C12.0389 7.375 11.854 7.375 11.4844 7.375H8.5V3.625Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.5 16C12.6421 16 16 12.6421 16 8.5C16 4.35786 12.6421 1 8.5 1C4.35786 1 1 4.35786 1 8.5C1 12.6421 4.35786 16 8.5 16Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
