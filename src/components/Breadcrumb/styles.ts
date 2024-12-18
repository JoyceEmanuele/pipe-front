import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { colors } from '../../styles/colors';

const base = `
  font-size: 12px;
  font: Inter;
  line-height: 13.31px;
  color: #858585;
  font-weight: 400;
  cursor: pointer;
  svg {
    margin-right: 4px;
  }
  &:hover {
    color: #000000;
  }
  &:hover svg path {
    fill: #000;
  }
`;

export const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  ${base}
  cursor: pointer;
`;

export const Separator = styled.span`
  ${base}
  text-decoration: none;
  color: #858585;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const Wrapper = styled.div<{ MenuOpen: boolean, isDesktop: boolean }>(
  ({ MenuOpen, isDesktop }) => `
  display: flex;
  align-items: center;
  width: ${isDesktop ? '100vw' : '100%'};
  flex-wrap: wrap;
  gap: 5px;
  position: ${isDesktop ? 'fixed' : ''};
  top: 50px;
  z-index: 500;
  background-color: ${colors.White};
  border-bottom: 1px solid #74747433;
  padding: ${isDesktop ? '10px' : '10px 0px'};
  left: ${MenuOpen ? '260px' : '65px'};
  margin-bottom: 10px;
  ${Separator} {
    &:last-child {
      display: none;
    }
  }

  ${StyledLink} {
    &:last-of-type {
      color: #000000;
      font-size: 12px;
      font-weight: bold;
      text-decoration-line: none;
    }
  }
`,
);

export const Seta = styled.div`
    width: 7px;
    height: 8px;
    background-color: #C2C2C2;
    clip-path: polygon(0% 0%, 100% 50%, 0% 100%);
    border-radius: 3px;
    margin: 0px 10px 0px 0px;
`;
