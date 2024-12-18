interface CollapseIconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
  className?: string;
  style?: {};
}

export const CollapseIcon = ({
  color, className, style, ...props
}: CollapseIconProps): JSX.Element => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" style={style} className={className} {...props}>
    <path d="M7.47171 9.27785C7.80349 9.22877 8.08856 9.51384 8.03948 9.84562L7.32681 14.6641C7.2667 15.0706 6.76918 15.2351 6.47864 14.9445L2.37281 10.8387C2.08227 10.5481 2.24674 10.0506 2.65321 9.99052L7.47171 9.27785Z" fill={color ?? '#363BC4'} />
    <path d="M9.75681 8.03319C9.42502 8.08226 9.13996 7.7972 9.18903 7.46541L9.9017 2.64691C9.96182 2.24045 10.4593 2.07597 10.7499 2.36651L14.8557 6.47235C15.1462 6.76289 14.9818 7.2604 14.5753 7.32052L9.75681 8.03319Z" fill={color ?? '#363BC4'} />
  </svg>
);
