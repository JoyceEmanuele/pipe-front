import { colors } from '../../styles/colors';

import {
  Container,
  Circular,
  Circle,
} from './styles';

export const Loader = ({ variant, size, ...props }: { variant?: 'primary'|'secondary', size?: 'large'|'small' }): JSX.Element => (
  <Container size={size} {...props}>
    <Circular viewBox="25 25 50 50">
      <Circle
        stroke={variant === 'secondary' ? colors.White : colors.A350}
        cx="50"
        cy="50"
        r="20"
        fill="none"
        stroke-miterlimit="10"
      />
    </Circular>
  </Container>
);
