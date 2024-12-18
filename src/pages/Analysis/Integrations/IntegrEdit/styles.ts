import styled from 'styled-components';

import {
  Button,
} from '~/components';
import { colors } from '~/styles/colors';

export const InfoItem = styled.div`
  width: 150px;
  margin-right: 20px;
  margin-bottom: 30px;
`;

export const CardIntem = styled(Button)`
  width: auto;
  padding: 0 8px;
  margin-left: 5px;
`;

export const TableNew2 = styled.table`
  white-space: nowrap;
  box-shadow: rgba(62, 71, 86, 0.2) 0px 2px 8px;
  border-collapse: collapse;
  & tbody {
    border: 1px solid ${colors.Grey};
    & tr {
      height: 35px;
      &:not(:last-child) {
        border-bottom: 1px solid ${colors.Grey};
      }
      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
    & td {
      text-align: left;
      color: ${colors.DarkGrey};
      padding: 0 10px;
      font-size: 0.71rem
    }
  }
  & thead {
    & tr {
      height: 40px;
      display: table-row;
    }
    & th {
      flex: 1;
      justify-content: space-between;
      align-items: center;
      padding: 0 10px;
      word-break: normal;
      border-bottom: solid 1px ${colors.Grey};
      font-size: 0.75rem;
      background-color: ${colors.Blue300};
      color: ${colors.White};
      &:first-child {
        border-top-left-radius: 10px;
      }
      &:last-child {
        border-top-right-radius: 10px;
      }
    }
  }
`;

export const FileInput = styled.label`
  border-radius: 5px;
  border-style: solid;
  border-width: 1px;
  cursor: pointer;
  font-size: 1em;
  font-family: 'Open Sans', sans-serif;
  font-weight: bold;
  outline: none;
  padding: 8px 0px;
  text-decoration: none;
  text-transform: uppercase;
  transition: all 0.2s ease-in-out;
  width: 100%;
  box-shadow: 0px 7px 12px rgba(83, 104, 111, 0.12), 0px 11px 15px rgba(85, 97, 115, 0.1);
  background-color: ${colors.Pink200};
  border-color: ${colors.Pink200};
  color: ${colors.White};
  transition: all 0.3s ease-in-out;
  &:hover {
    background-color: ${colors.Pink300};
    border-color: ${colors.Pink300};
    box-shadow: 0px 7px 12px rgba(83, 104, 111, 0.35), 0px 11px 15px rgba(85, 97, 115, 0.25);
  }
`;

export const BtnClean = styled.div`
  cursor: pointer;
  color: ${colors.BlueSecondary};
  margin-left: 20px;
  text-decoration: underline;
  font-size: 12px;
`;

export const ControlTemperatureButton = styled.div<{ isActive?: boolean, noBorder?: boolean }>`
  border: 0.7px solid ${colors.GreyInputBorder};
  ${({ noBorder }) => (noBorder ? 'border: 0;' : '')}
  border-radius: 5px;
  width: 70px;
  height: 70px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ isActive }) => (isActive ? `background-color: ${colors.BlueSecondary};` : '')}
`;

export const SetpointButton = styled.div<{ up?: boolean, down?: boolean }>`
  flex-basis: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 0.7px solid ${colors.GreyInputBorder};
  user-select: none;
  ${({ up }) => (up ? `border-bottom: 0.7px solid  ${colors.GreyInputBorder}` : '')}
  ${({ down }) => (down ? `border-top: 0.7px solid ${colors.GreyInputBorder}` : '')}
`;

export const SelectSearchStyled = styled.div`
  .select-search__option {
    min-height: 36px;
    height: fit-content;
  }
`;
