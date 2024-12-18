interface CircleCheckFillProps {
  color?: string;
  height?: string;
  width?: string;
}

export const CircleCheckFill = ({ color, height, width }: CircleCheckFillProps): JSX.Element => (
  <svg width={width || '24'} height={height || '24'} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24.0015 11.9999C24.0015 18.6273 18.6289 23.9999 12.0015 23.9999C5.37405 23.9999 0.00146484 18.6273 0.00146484 11.9999C0.00146484 5.37251 5.37405 -7.62939e-05 12.0015 -7.62939e-05C18.6289 -7.62939e-05 24.0015 5.37251 24.0015 11.9999Z" fill={color || '#5ECA21'} />
    <path fillRule="evenodd" clipRule="evenodd" d="M17.8943 7C18.6006 7.73082 19.2918 8.4459 19.9998 9.17841C16.7478 12.4506 14.5012 14.7176 11.239 18C9.48225 16.2211 7.7358 14.4527 5.99976 12.6948C6.70567 11.9895 7.40033 11.2955 8.10919 10.5872C9.14034 11.6203 10.1811 12.6631 11.2358 13.7199C13.7931 11.1421 15.3367 9.57817 17.8943 7Z" fill="white" />
  </svg>
);
