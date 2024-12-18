import {
  StatusText,
  Container,
} from './styles';

export const OnOff = ({ status, size, margin }): JSX.Element => (
  <Container margin={margin} color={status}>
    <StatusText color={status}>
      {status === 'ONLINE' || status === 1
        ? size === 'short'
          ? 'LIGADO'
          : 'ONLINE'
        : size === 'short'
          ? 'DESLIGADO'
          : 'OFFLINE'}
    </StatusText>
  </Container>
);
