import {
  StatusText,
  Container,
} from './styles';

export const OnlineOffline = ({ status, size, margin }): JSX.Element => (
  <Container margin={margin} color={status === 'ONLINE' ? 'rgba(41, 107, 150, 0.3)' : 'rgba(150, 150, 150, 0.3)'}>
    <StatusText color={status === 'ONLINE' ? '#296b96' : '#767676'}>{status}</StatusText>
  </Container>
);
