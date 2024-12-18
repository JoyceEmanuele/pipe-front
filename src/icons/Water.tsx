type WaterIconProps = {
  width?: string;
  height?: string;
  color?: string;
}

export const WaterIcon = ({ width = '18px', height = '22px', color = '#2D81FF' }: WaterIconProps): JSX.Element => (
  <svg width={width} height={height} viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.21147 20C7.30192 20 5.47057 19.2414 4.12031 17.8912C2.77004 16.5409 2.01147 14.7096 2.01147 12.8C2.01147 9.6482 4.45048 7.1273 6.59518 4.817L9.21147 2L11.8278 4.817C13.9725 7.1282 16.4115 9.6491 16.4115 12.8C16.4115 14.7096 15.6529 16.5409 14.3026 17.8912C12.9524 19.2414 11.121 20 9.21147 20Z" fill={color} stroke={color} strokeWidth="2.64" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
