type ClockDurationIconProps = {
  width?: string;
  height?: string;
}

export const ClockDurationIcon = ({ width = '15', height = '15', ...props }: ClockDurationIconProps): JSX.Element => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} {...props} viewBox="0 0 15 15" fill="none">
    <path d="M7.5 1V2.625M7.5 1C3.91015 1 1 3.91015 1 7.5M7.5 1C11.0899 1 14 3.91015 14 7.5M7.5 12.375V14M7.5 14C11.0899 14 14 11.0899 14 7.5M7.5 14C3.91015 14 1 11.0899 1 7.5M2.625 7.5H1M14 7.5H12.375M12.101 12.101L10.948 10.948M2.89906 12.101L4.05315 10.9469M2.89906 2.95L4.02775 4.07869M12.101 2.95L8.47494 6.525M8.8 7.5C8.8 8.21797 8.21797 8.8 7.5 8.8C6.78203 8.8 6.2 8.21797 6.2 7.5C6.2 6.78203 6.78203 6.2 7.5 6.2C8.21797 6.2 8.8 6.78203 8.8 7.5Z" stroke="#363BC4" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
