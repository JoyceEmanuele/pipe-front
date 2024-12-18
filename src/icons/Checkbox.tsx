type CheckboxIconProps = {
  color?: string;
  size?: number;
}

export const CheckboxIcon = ({ color, size }: CheckboxIconProps): JSX.Element => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24">
    <path fill="none" d="M0 0h24v24H0z" />
    <path fill={color || 'white'} d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
  </svg>
);
