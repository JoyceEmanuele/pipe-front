import { Header } from '../Header';
import { Menu } from '../Menu';

import { Wrapper } from './styles';

export const DesktopNavbar = (): JSX.Element => (
  <Wrapper>
    <Header />
    <Menu />
  </Wrapper>
);
