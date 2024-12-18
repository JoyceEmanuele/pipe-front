type WaterOutletProps = {
  width?: string;
  height?: string;
  color?: string;
}

export const WaterOutlet = ({ width = '7px', height = '12px', color = '#363BC4' }: WaterOutletProps): JSX.Element => (
  <svg width={width} height={height} viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 4.5C6 5.32843 5.32843 6 4.5 6C3.67157 6 3 5.32843 3 4.5C3 3.42157 4.5 1 4.5 1C4.5 1 6 3.42157 6 4.5Z" stroke={color} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 2.75C2.5 3.16421 2.16421 3.5 1.75 3.5C1.33579 3.5 1 3.16421 1 2.75C1 2.21079 1.75 1 1.75 1C1.75 1 2.5 2.21079 2.5 2.75Z" stroke={color} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.96533 8V10.3265" stroke={color} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1.6001 8.53687V9.78958M6.1441 8.53687V9.78958" stroke={color} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.13847 11.248C4.06149 11.3813 3.86904 11.3813 3.79206 11.248L3.11423 10.0739C3.03725 9.94061 3.13348 9.77395 3.28744 9.77395L4.64309 9.77395C4.79705 9.77395 4.89327 9.94061 4.81629 10.0739L4.13847 11.248Z" fill={color} />
  </svg>
);
