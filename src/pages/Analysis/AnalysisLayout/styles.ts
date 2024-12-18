import styled from 'styled-components';
import { colors } from '~/styles/colors';

export const FilterContainer = styled.div`
  display: flex;
  width: 100%;
`;

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
  z-index: 10;
  &:hover {
    cursor: pointer;
    background-color: ${colors.BlueSecondary};
    color: white;
    svg path {
      fill: white !important;
    }
  }
`;

export const ContainerFilterOptions = styled.div`

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

export const SearchInput = styled.div`
  min-height: 48px;
  margin: 0;
  font-size: 12px;
  margin-left: 16px;
  color: #000;
  width: 100%;
  border: 1px solid #E9E9E9;
  border-radius: 5px;
  box-sizing: border-box !important;
  display: inline-flex;
  background-color: #fff;
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
