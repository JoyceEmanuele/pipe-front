import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const StyledSpan = styled.span`
font-size: 1em;
font-weight: bold;
color: ${colors.Grey400};
`;

export const MachineHeaderContainer = styled.div`
  display: flex;
  flex: 1;
  align-items: flex-start;

  .input-container {
    display: flex;
    flex: 1;
    justify-content: flex-end;

    > div {
      height: 50px;
      min-width: 250px;
    }

    > div + div {
      margin-left: 32px;
      height: 50px;
    }
  }
`;

export const ViewModeButton = styled.button<{ isActive: boolean }>`
  cursor: pointer;
  width: 80px;
  height: 26px;
  background-color: #ffffff;

  border: ${(props) => (props.isActive ? '2px solid #363bc4' : 0)};
  border-radius: 5px;

  font-size: 11px;
  font-weight: 600;
  color: ${(props) => (props.isActive ? '#363BC4' : '#7A7A7A')};

  > span {
    margin-right: 2px;
  }

  & + & {
    margin-left: 10px;
  }

  transition: filter 0.3s;

  &:hover {
    filter: brightness(0.9);
  }
`;

export const MosaicMachineList = styled.div`
  display: flex;
  flex-flow: wrap;
  gap: 16px;

  max-height: 634px;
  width: 100%;
  margin-bottom: 20px;
  padding: 30px;
  border: 1px solid #d7d7d7;
  border-radius: 8px;

  overflow-y: scroll;
`;

export const TableList = styled.div`
  margin: 20px 0 20px 0;
`;

export const TooltipContainer = styled.div`
  display: flex;
  flex-direction: column;

  > span {
    font-size: 9px;
    line-height: 11px;
    color: #656565;
  }

  > strong {
    font-size: 10px;
    line-height: 12px;
  }
`;

export const SearchInput = styled.div`
  min-height: 48px;
  max-width: 250px;
  margin: 0;
  font-size: 12px;
  color: #000;
  width: 100%;
  border: 1px solid #818181;
  border-radius: 5px;
  box-sizing: border-box !important;
  display: inline-flex;
`;

export const Label = styled.span`
  transition: all 0.2s;
  margin-top: -6px;
  margin-left: 16px;
  margin-right: 16px;
  color: ${colors.Blue700};
  font-size: 11px;
  font-weight: bold;
`;

export const Link = styled.div`
  font-size: 11px;
  line-height: 13px;
  color: #363BC4;
  text-decoration: underline;

  margin-top: 6px;

  cursor: pointer;
`;
