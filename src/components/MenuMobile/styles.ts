import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { colors } from '../../styles/colors';

export const StyledLink = styled(Link)`
  text-decoration: none;
`;

export const Background = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  position: absolute;
  height: 100vh;
  width: 100vw;
  top: 0;
  background-color: #363BC4;
  z-index: 600;
`;

export const LogoContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.2);
  margin-bottom: 10px;
  height: 60px;
`;

export const CustomLogo = styled.img`
  width: 165px;
  height: 60px;
  cursor: pointer;
`;

export const CustomSpringerLogo = styled.img`
  width: 150px;
  cursor: pointer;
`;
export const MenuItem = styled.div<{ isActive }>(
  ({ isActive }) => `
  ${
  isActive
    ? `background-color: ${colors.Blue500};`
    : ''
}
  height: 41px;
  display: flex;
  padding-left: 32px;
  justify-content: center;
  align-items: flex-start;
  flex-direction: column;
  cursor: pointer;
  width: 100%;
  position: relative;
`,
);

export const MenuHighlight = styled.div<{ isActive }>(
  ({ isActive }) => `
  visibility: ${isActive ? 'visible' : 'hidden'};
  position: absolute;
  width: 8px;
  height: 41px;
  left: 0px;
  background: ${colors.GrenTab};
`,
);

export const MenuItemName = styled.span`
  font-size: 1.5em;
  text-align: center;
  color: ${colors.White};
`;
