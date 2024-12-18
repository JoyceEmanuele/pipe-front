import styled from 'styled-components';
import { colors } from '~/styles/colors';
import { Link } from 'react-router-dom';

export const SearchInput = styled.div<{ menuOpened?: boolean; }>`
  min-height: 48px;
  margin: 0;
  font-size: 12px;
  margin-left: ${(props) => (props.menuOpened ? '12px' : '16px')};
  color: #000;
  width: 100%;
  border: 1px solid #E9E9E9;
  border-radius: 5px;
  min-width: 219px;
  box-sizing: border-box !important;
  display: inline-flex;
  background-color: #fff;
  @media (min-width: 1600px) {
    margin-left: ${(props) => (props.menuOpened ? '16px' : '60px')};
  }
`;

export const Label = styled.label`
  position: relative;
  display: inline-block;
  width: 100%;
  margin-top: 6px;
  margin-left: 16px;
  margin-right: 16px;
  color: #202370;
  font-size: 11px;
  font-weight: bold;
`;

export const StatusIcon = styled.div<{ color?, status?}>(
  ({ color, status }) => `
  width: 10px;
  height: 10px;
  margin-left: 5px;
  border-radius: 50%;
  border: 2px solid ${color || (status === 'ONLINE' ? colors.Blue300 : colors.Grey200)};
  background: ${color || (status === 'ONLINE' ? colors.Blue300 : colors.Grey200)};
  font-weight: bold;
  font-size: 0.8em;
  line-height: 18px;
  color: ${colors.White};
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: capitalize;
`,
);

export const ControlFilter = styled.div`
  border: 1px solid #E9E9E9;
  border-radius: 5px;
  background-color: #ffffff;
  padding: 6px 10px;
  user-select: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  z-index: 1;
  &:hover {
    cursor: pointer;
    background-color: ${colors.BlueSecondary};
    color: white;
    svg path {
      fill: white !important;
    }
  }
`;

export const CleanBtn = styled.div<{ menuOpened?: boolean; }>`
  cursor: pointer;
  position: relative;
  bottom: 2;
  left: 18;
  display: inline-block;
  color: ${colors.BlueSecondary};
  margin-top: 5px;
  margin-left:  ${(props) => (props.menuOpened ? '14px' : '18px')};;
  text-decoration: underline;
  font-size: 11px;

  &:hover {
    color: ${colors.Blue400};
  }
  @media (min-width: 1600px) {
    margin-left: ${(props) => (props.menuOpened ? '18px' : '60px')};
  }
`;

export const ExportBtn = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border: 1px solid ${colors.GreyDefaultCardBorder};
  border-radius: 10px;
  padding: 6px 10px;

  &:hover {
    cursor: pointer;
    background-color: ${colors.BlueSecondary};
    color: white;
    svg path {
      fill: white !important;
    }
  }
`;

export const StyledLink = styled(Link)`
  color: ${colors.Grey400};
  margin: 0 8px 0 8px;
`;
