type WaterInletProps = {
  width?: string;
  height?: string;
  color?: string;
}

export const WaterInlet = ({ width = '7px', height = '12px', color = '#363BC4' }: WaterInletProps): JSX.Element => (
  <svg width={width} height={height} viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9.5C6 10.3284 5.32843 11 4.5 11C3.67157 11 3 10.3284 3 9.5C3 8.42157 4.5 6 4.5 6C4.5 6 6 8.42157 6 9.5Z" stroke={color} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 7.75C2.5 8.16421 2.16421 8.5 1.75 8.5C1.33579 8.5 1 8.16421 1 7.75C1 7.21079 1.75 6 1.75 6C1.75 6 2.5 7.21079 2.5 7.75Z" stroke={color} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.96533 1V3.32647" stroke={color} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1.6001 1.53687V2.78958M6.1441 1.53687V2.78958" stroke={color} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.13847 4.24797C4.06149 4.38131 3.86904 4.38131 3.79206 4.24797L3.11423 3.07395C3.03725 2.94061 3.13348 2.77395 3.28744 2.77395L4.64309 2.77395C4.79705 2.77395 4.89327 2.94061 4.81629 3.07395L4.13847 4.24797Z" fill={color} />
  </svg>
);
