import { colors } from '../styles/colors';

type AddIconProps = {
  color?: string;
}

export const AddIcon = ({ color = colors.Grey400, ...props }: AddIconProps): JSX.Element => (
  <svg {...props} width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5.14286 0V5.14286H0V6.85714H5.14286L5.14286 12H6.85714L6.85714 6.85714L12 6.85714V5.14286L6.85714 5.14286V0H5.14286Z"
      fill={color}
    />
  </svg>
);
