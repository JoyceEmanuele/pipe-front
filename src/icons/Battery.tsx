type BatteryIconProps = {
  width?: string;
  height?: string;
}

export const BatteryIcon = ({ width = '20', height = '12', ...props }: BatteryIconProps): JSX.Element => (
  <svg width={width} height={height} {...props} viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.27949 8.65L10.7073 6.1H7.2805L8.70835 3.55M18.846 6.95V5.25M5.8241 11.2H12.1637C13.6031 11.2 14.3228 11.2 14.8726 10.9221C15.3562 10.6776 15.7494 10.2875 15.9958 9.80768C16.2759 9.2622 16.2759 8.54813 16.2759 7.12V5.08C16.2759 3.65187 16.2759 2.9378 15.9958 2.39232C15.7494 1.91251 15.3562 1.52241 14.8726 1.27793C14.3228 1 13.6031 1 12.1637 1H5.8241C4.3847 1 3.665 1 3.11522 1.27793C2.63162 1.52241 2.23845 1.91251 1.99204 2.39232C1.71191 2.9378 1.71191 3.65187 1.71191 5.08V7.12C1.71191 8.54813 1.71191 9.2622 1.99204 9.80768C2.23845 10.2875 2.63162 10.6776 3.11522 10.9221C3.665 11.2 4.3847 11.2 5.8241 11.2Z" stroke="#363BC4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
