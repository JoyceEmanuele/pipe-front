import { colors } from '../styles/colors';

type BlockedIconProps = {
  color?: string;
  width?: string;
}

export const BlockedIcon = ({ width = '24px', color = colors.Grey400, ...props }: BlockedIconProps): JSX.Element => (
  <svg {...props} width={width} height={width} viewBox="0 0 427 427" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fill={color}
      d="M213.333,0C95.467,0,0,95.467,0,213.333s95.467,213.333,213.333,213.333S426.667,331.2,426.667,213.333S331.2,0,213.333,0
      z M42.667,213.333c0-94.293,76.373-170.667,170.667-170.667c39.467,0,75.627,13.547,104.533,35.947L78.613,317.867
      C56.213,288.96,42.667,252.8,42.667,213.333z M213.333,384c-39.467,0-75.627-13.547-104.533-35.947L348.053,108.8
      C370.453,137.707,384,173.867,384,213.333C384,307.627,307.627,384,213.333,384z"
    />
  </svg>
);
