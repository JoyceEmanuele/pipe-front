interface ExpandIconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
  className?: string;
  style?: {};
}

export const ExpandIcon = ({
  color, className, style, ...props
}: ExpandIconProps): JSX.Element => (
  <svg className={className} width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} {...props}>
    <path d="M10.59 0.589996L6 5.17L1.41 0.589996L0 2L6 8L12 2L10.59 0.589996Z" fill={color || '#5D5D5D'} />
  </svg>
);
