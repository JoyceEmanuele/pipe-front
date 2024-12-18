type EnergyIconProps = {
    color?: string;
  }

export const NobreakOffIcon = ({ color = '#363BC4' }: EnergyIconProps): JSX.Element => (
  <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.27465 1V8.22222M12.9042 4.35111C13.8202 5.26023 14.444 6.41843 14.6966 7.67924C14.9492 8.94006 14.8193 10.2469 14.3234 11.4345C13.8275 12.6221 12.9878 13.6371 11.9105 14.3512C10.8332 15.0654 9.56664 15.4465 8.27101 15.4465C6.97538 15.4465 5.70884 15.0654 4.63154 14.3512C3.55423 13.6371 2.71453 12.6221 2.21862 11.4345C1.72271 10.2469 1.59284 8.94006 1.84545 7.67924C2.09806 6.41843 2.7218 5.26023 3.6378 4.35111" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
