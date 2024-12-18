import { colors } from 'styles/colors';

interface CloseIconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
  size?: string;
  onClick?: () => void;
}

export const CloseIcon = ({
  size = '10px', color = colors.Grey400, onClick, ...props
}: CloseIconProps): JSX.Element => (
  <svg {...props} onClick={onClick} width={size} height={size} viewBox="0 0 18 18">
    <path
      d="M1.26326 2.06602C0.911502 1.71113 0.907553 1.14029 1.25437 0.780563C1.6111 0.410554 2.20187 0.404814 2.56572 0.767823L8.99996 7.18716L15.4342 0.767823C15.798 0.404814 16.3888 0.410554 16.7456 0.780563C17.0924 1.14029 17.0884 1.71113 16.7367 2.06602L10.3571 8.50242L16.7295 14.9093C17.0906 15.2724 17.0895 15.8593 16.727 16.221C16.3647 16.5825 15.7781 16.5825 15.4158 16.221L8.99996 9.82009L2.58416 16.221C2.22183 16.5825 1.63527 16.5825 1.27293 16.221C0.910403 15.8593 0.909271 15.2724 1.2704 14.9093L7.64279 8.50242L1.26326 2.06602Z"
      fill={color}
    />
  </svg>
);
