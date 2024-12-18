type DeleteSimpleIconProps = {
  color?: string;
  size?: number;
}

export const DeleteSimpleIcon = ({ color = '#6A6A6A', size = 19, ...props }: DeleteSimpleIconProps): JSX.Element => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 19 19" fill="none">
    <path d="M4.48416 13.0911L13.102 4.4732L14.5645 5.93562L5.94659 14.5535L4.48416 13.0911ZM4.48416 5.93562L5.94659 4.4732L14.5645 13.0911L13.102 14.5535L4.48416 5.93562Z" fill={color} />
  </svg>
);
