interface ExpandCardIconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
  className?: string;
  style?: {};
}

export const ExpandCardIcon = ({
  color, className, style, ...props
}: ExpandCardIconProps): JSX.Element => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" style={style} className={className} {...props}>
    <path d="M3.85471 14.0305C3.52292 14.0796 3.23786 13.7945 3.28693 13.4627L3.9996 8.64423C4.05972 8.23776 4.55724 8.07329 4.84778 8.36383L8.95361 12.4697C9.24415 12.7602 9.07967 13.2577 8.67321 13.3178L3.85471 14.0305Z" fill={color || '#363BC4'} />
    <path d="M13.3741 3.28053C13.7058 3.23146 13.9909 3.51652 13.9418 3.84831L13.2292 8.66681C13.169 9.07327 12.6715 9.23775 12.381 8.94721L8.27515 4.84137C7.98461 4.55083 8.14909 4.05332 8.55555 3.9932L13.3741 3.28053Z" fill={color || '#363BC4'} />
  </svg>
);
