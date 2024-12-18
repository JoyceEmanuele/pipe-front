type ThermostatCircleIconProps = {
  color?: string;
}

export const ThermostatCircleIcon = ({ color = '#363BC4' }: ThermostatCircleIconProps): JSX.Element => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.5 18C14.1944 18 18 14.1944 18 9.5C18 4.80558 14.1944 1 9.5 1C4.80558 1 1 4.80558 1 9.5C1 14.1944 4.80558 18 9.5 18Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.5 13.75C11.8472 13.75 13.75 11.8472 13.75 9.5C13.75 7.15279 11.8472 5.25 9.5 5.25C7.15279 5.25 5.25 7.15279 5.25 9.5C5.25 11.8472 7.15279 13.75 9.5 13.75Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
