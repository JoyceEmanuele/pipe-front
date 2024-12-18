type WarningIconProps = {
  color?: string;
}

export const WarningIcon = ({ color, ...props }: WarningIconProps): JSX.Element => (
  <svg {...props} height="20px" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 3.62727L16.8455 15.4545H3.15455L10 3.62727ZM10 0L0 17.2727H20L10 0ZM10.9091 12.7273H9.09091V14.5455H10.9091V12.7273ZM10.9091 7.27273H9.09091V10.9091H10.9091V7.27273Z"
      fill={color || '#5D5D5D'}
    />
  </svg>
);
