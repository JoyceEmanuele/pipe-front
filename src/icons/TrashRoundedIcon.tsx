interface TrashRoundedIconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
  handleClick?: () => void
}

export const TrashRoundedIcon = ({ color = '#363BC4', handleClick, ...props }: TrashRoundedIconProps): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 18 19"
    fill="none"
    onClick={handleClick}
    {...props}
  >
    <path
      d="M12.7411 4.40741V3.72593C12.7411 2.77176 12.7411 2.29468 12.5554 1.93024C12.392 1.60967 12.1314 1.34903 11.8108 1.18569C11.4464 1 10.9693 1 10.0151 1H8.65218C7.69801 1 7.22093 1 6.85649 1.18569C6.53592 1.34903 6.27528 1.60967 6.11194 1.93024C5.92625 2.29468 5.92625 2.77176 5.92625 3.72593V4.40741M7.62995 9.09259V13.3519M11.0374 9.09259V13.3519M1.66699 4.40741H17.0003M15.2966 4.40741V13.9481C15.2966 15.3794 15.2966 16.095 15.0181 16.6417C14.7731 17.1225 14.3821 17.5135 13.9013 17.7585C13.3546 18.037 12.639 18.037 11.2077 18.037H7.45959C6.02834 18.037 5.31272 18.037 4.76605 17.7585C4.28519 17.5135 3.89424 17.1225 3.64923 16.6417C3.3707 16.095 3.3707 15.3794 3.3707 13.9481V4.40741"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
