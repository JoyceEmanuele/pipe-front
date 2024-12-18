import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const StyledLink = styled(Link)`
  text-decoration: none;
`;

export const NavItem = styled.span<{ isBold? }>(
  ({ isBold }) => `
  ${isBold ? 'font-weight: bold;' : ''}
  font-size: 1.5em;
  color: ${colors.White};
`,
);

export const UserContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: fixed;
  height: 100vh;
  width: 100vw;
  top: 0;
  padding-top: 94px;
  background-color: ${colors.Blue500};
  z-index: 2;
`;

export const WrapperItem = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 16px 0;
  border-top: 1px solid ${colors.BlueChart};
  text-align: center;
`;

export const RelativeWrapper = styled.div`
  position: relative;
`;

export const CloseWrapper = styled.div`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  height: auto;
  z-index: 800;
  top: 22px;
  left: 15px;
`;

export const ModalNavItems = styled.div`
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
`;

export const ActionableWrapper = styled.div`
  width: auto;
  height: auto;
`;

export const Icon = styled.img`
  cursor: pointer;
`;

export const IconRotate = styled.img`
  cursor: pointer;
  transform: rotate(90deg)
`;

export const Logo = styled.img`
  width: 165px;
  height: 42px;
  cursor: pointer;
`;

export const SpringerLogo = styled.img`
  width: 150px;
  cursor: pointer;
`;

export const Topbar = styled.div`
  width: 100%;
  height: 60px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.2);
`;

export const Wrapper = styled.div`
  display: block;
  @media (min-width: 768px) {
    display: none;
  }
`;
