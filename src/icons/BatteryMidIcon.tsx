type BatteryMidIconIconProps = {
    color?: string;
  }

export const BatteryMidIcon = ({ color = '#363BC4' }: BatteryMidIconIconProps): JSX.Element => (
  <svg width="19" height="12" viewBox="0 0 19 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.625 4.3999V7.7999" stroke="#D1D1D1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.825 4.4V7.8M8.225 4.4V7.8M18 6.95V5.25M5.08 11.2H11.37C12.7981 11.2 13.5122 11.2 14.0577 10.9221C14.5375 10.6776 14.9276 10.2875 15.1721 9.80768C15.45 9.2622 15.45 8.54813 15.45 7.12V5.08C15.45 3.65187 15.45 2.9378 15.1721 2.39232C14.9276 1.91251 14.5375 1.52241 14.0577 1.27793C13.5122 1 12.7981 1 11.37 1H5.08C3.65187 1 2.9378 1 2.39232 1.27793C1.91251 1.52241 1.52241 1.91251 1.27793 2.39232C1 2.9378 1 3.65187 1 5.08V7.12C1 8.54813 1 9.2622 1.27793 9.80768C1.52241 10.2875 1.91251 10.6776 2.39232 10.9221C2.9378 11.2 3.65187 11.2 5.08 11.2Z" stroke="#363BC4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
