import { colors } from '../../styles/colors';
import { StyledDivider } from './styles';

interface DividerProps{
  width?: number
  height?: number
  color?: string
}

export const Divider: React.FC<DividerProps> = ({ width = 100, height = 2, color = colors.GreyDefaultCardBorder }) => (
  <StyledDivider width={width} height={height} color={color} />
);
