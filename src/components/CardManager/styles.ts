import styled from 'styled-components';
import { colors } from '../../styles/colors';

export const Dropdown = styled.div`
  box-shadow: 0px 2px 8px ${colors.Grey300};
  border-radius: 3px;
  position: absolute;
  z-index: 9999;
  top: 37px;
  right: 0;
  width: 203px;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  background-color: ${colors.White};
`;

export const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  color: ${colors.Blue300};
  cursor: pointer;
  color: #77818b;
  width: 100%;
  text-decoration: none;
  padding: 0.5rem;
  transition: all 0.2s ease-in-out;
  &:hover {
    color: ${colors.White};
    background-color: ${colors.Blue300};
  }
`;

export const DropdownItemTitle = styled.span`
  display: flex;
  align-items: center;
  font-size: 12px;
  margin-left: 8px;
  white-space: pre;
`;
