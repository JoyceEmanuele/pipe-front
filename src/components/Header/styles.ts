import styled from 'styled-components';

import { ExpandIcon } from '../../icons';
import { colors } from 'styles/colors';

export const Container = styled.header<{ MenuOpen: boolean }>(
  ({ MenuOpen }) => `
  display: flex;
  font-size: 1em;
  align-items: center;
  justify-content: space-between;
  background-color: ${colors.White};
  border-bottom: 1px solid #74747433;
  top: 0;
  left: 0;
  height: 40px;
  padding: ${MenuOpen ? '25px 40px' : '25px 20px'};
  position: fixed;
  width: 100vw;
  z-index: 899;
  font-size: 13px;
`,
);

export const UserOptions = styled.div`
  cursor: pointer;
  display: flex;
  padding: 20px 0;
  position: relative;
  justify-content: end;
`;

export const Welcome = styled.span`
  color: #000;
`;

export const Expand = styled(ExpandIcon)<{ expanded }>`
  align-self: center;
  margin-left: 10px;
  transition: transform 0.2s ease-in-out;
  transform: rotate(${({ expanded }) => (expanded ? 180 : 0)}deg);
`;

export const List = styled.div`
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #74747433;
  border-radius: 0px 0px 8px 8px;
  border-top: none;
  position: absolute;
  top: 57px;
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  background-color: ${colors.White};
  gap: 10px;
`;

export const Item = styled.a`
  color: ${colors.Grey300};
  cursor: pointer;
  color: #77818b;
  width: 100%;
  text-decoration: none;


`;

export const ItemTitle = styled.span`
  margin-left: 10px;
  color: #000;
  &:hover {
    color: ${colors.Blue300};
  }
`;
