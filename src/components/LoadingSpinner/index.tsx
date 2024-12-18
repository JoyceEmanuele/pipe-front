import { colors } from '../../styles/colors';

import {
  Container,
  Circular,
  Circle,
  Overlay,
} from './styles';

type LoadingSpinnerProps = {
  variant?: 'primary'|'secondary';
  size?: 'large'|'small';
  loading: boolean;
}

export const LoadingSpinner = ({
  variant, size, loading, ...props
}: LoadingSpinnerProps): JSX.Element => (loading ? (
  <Overlay>
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
  </Overlay>
) : <></>);
