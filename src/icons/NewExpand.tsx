interface NewExpandIconProps extends React.SVGProps<SVGSVGElement> {
    color?: string;
    className?: string;
    style?: {};
  }

export const NewExpandIcon = ({
  color, className, style, ...props
}: NewExpandIconProps): JSX.Element => (
  <svg width="8" height="10" viewBox="0 0 6 7" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} {...props}>
    <path d="M0.597817 4.1267C-0.0941366 3.74704 -0.0941377 2.75296 0.597815 2.3733L4.22699 0.382018C4.89342 0.0163555 5.70802 0.498561 5.70802 1.25872L5.70802 5.24128C5.70802 6.00144 4.89342 6.48365 4.22699 6.11798L0.597817 4.1267Z" fill="#202370" />
  </svg>

);
