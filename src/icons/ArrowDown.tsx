type ArrowDownIconProps = {
    color?: string;
    style?: {};
    heigth?: string;
    width?: string;
}

export const ArrowDownIcon = ({ color = '#000000', ...props }: ArrowDownIconProps): JSX.Element => (
  <svg width={props.width || '8px'} height={props.heigth || '7px'} viewBox="0 0 8 7" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.62847 6.40218C4.2488 7.09414 3.25473 7.09414 2.87507 6.40218L0.449236 1.98103C0.0835739 1.3146 0.565781 0.499999 1.32594 0.499999L6.1776 0.5C6.93776 0.5 7.41996 1.3146 7.0543 1.98104L4.62847 6.40218Z" fill={color} />
  </svg>
);

export const ArrowDownIconV2 = ({
  color = '#202370', width = '13', heigth = '12', ...props
}: ArrowDownIconProps): JSX.Element => (
  <svg {...props} width={width} height={heigth} viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.95145 10.4284C7.4016 11.3808 6.02695 11.3808 5.4771 10.4284L1.14697 2.92844C0.597115 1.97606 1.28444 0.785581 2.38415 0.785581L11.0444 0.785582C12.1441 0.785582 12.8314 1.97606 12.2816 2.92844L7.95145 10.4284Z" fill={color} />
  </svg>
);
