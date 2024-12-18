type ArrowUpIconProps = {
  color?: string;
  style?: {};
  heigth?: string;
  width?: string;
}

export const ArrowUpIcon = ({ color = '#000000', ...props }: ArrowUpIconProps): JSX.Element => (
  <svg width={props.width || '8px'} height={props.heigth || '7px'} viewBox="0 0 8 7" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.87507 0.597814C3.25474 -0.0941392 4.24881 -0.0941386 4.62847 0.597815L7.05431 5.01896C7.41997 5.6854 6.93776 6.5 6.1776 6.5L1.32594 6.5C0.565786 6.5 0.0835809 5.6854 0.449243 5.01896L2.87507 0.597814Z" fill={color} />
  </svg>
);

export const ArrowUpIconV2 = ({
  color = '#202370', width = '12', heigth = '11', ...props
}: ArrowUpIconProps): JSX.Element => (
  <svg {...props} width={width} height={heigth} viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.7629 1.28568C5.31276 0.3333 6.6874 0.333297 7.23726 1.28568L11.5674 8.78567C12.1172 9.73805 11.4299 10.9285 10.3302 10.9285L1.66996 10.9285C0.570246 10.9285 -0.117078 9.73805 0.432779 8.78567L4.7629 1.28568Z" fill={color} />
  </svg>
);
