import styled from 'styled-components';

import { colors } from '../../styles/colors';

export const PaginationContainer = styled.div`
  height: 40px;
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 25px;
  margin-bottom: 25px;
  margin-right: 10px;
`;

export const Page = styled.div`
  font-size: 1.0rem;
  font-weight: bolder;
  background-color: ${colors.Grey};
  color: ${colors.White};
  border: 0;
  padding: 10px;
  box-shadow: 0px 7px 12px rgba(83, 104, 111, 0.12), 0px 11px 15px rgba(85, 97, 115, 0.1);
`;

export const ButtonPage = styled.button`
  cursor: pointer;
  outline: none;
  border: 0;
  padding: 10px;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  box-shadow: 0px 7px 12px rgba(83, 104, 111, 0.12), 0px 11px 15px rgba(85, 97, 115, 0.1);
  background-color: ${colors.Blue300};
  color: ${colors.White};
`;

export const TableContainer = styled.table`
  width: 99%;
  box-shadow: rgba(62, 71, 86, 0.2) 0px 2px 8px;
  border-collapse: collapse;
`;

export const TableHead = styled.thead`
`;

export const HeaderRow = styled.tr`
  height: 40px;
  display: table-row;
`;

export const HeaderCell = styled.th`
  flex: 1;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
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
`;

export const HeaderCellOrder = styled.th`
  flex: 1;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  border-bottom: solid 1px ${colors.Grey};
  font-size: 0.75rem;
  background-color: ${colors.Blue300};
  color: ${colors.White};
  cursor: pointer;
  &:first-child {
    border-top-left-radius: 10px;
  }
  &:last-child {
    border-top-right-radius: 10px;
  }
`;

export const ChevronTop = styled.span`
  border-style: solid;
  border-width: 0.25em 0.25em 0 0;
  content: '';
  display: inline-block;
  height: 0.45em;
  left: 0.15em;
  position: relative;
  top: 0.15em;
  transform: rotate(-45deg);
  vertical-align: top;
  width: 0.45em;
  margin-left: 10px;
  margin-top: 3px;
`;

export const ChevronBottom = styled.span`
  border-style: solid;
  border-width: 0.25em 0.25em 0 0;
  content: '';
  display: inline-block;
  height: 0.45em;
  left: 0.15em;
  position: relative;
  top: 0;
  transform: rotate(135deg);
  vertical-align: top;
  width: 0.45em;
  margin-left: 10px;
  margin-top: 3px;
`;

export const ChevronLeft = styled.span`
  border-style: solid;
  border-width: 0.25em 0.25em 0 0;
  content: '';
  display: inline-block;
  height: 0.65em;
  left: 0.15em;
  position: relative;
  top: 0.15em;
  transform: rotate(-45deg);
  vertical-align: top;
  width: 0.65em;
  left: 0.25em;
  transform: rotate(-135deg);
`;

export const ChevronRight = styled.span`
  border-style: solid;
  border-width: 0.25em 0.25em 0 0;
  content: '';
  display: inline-block;
  height: 0.65em;
  left: 0.15em;
  position: relative;
  top: 0.15em;
  transform: rotate(-45deg);
  vertical-align: top;
  width: 0.65em;
  left: 0;
  transform: rotate(45deg);
`;

export const TableBody = styled.tbody`
  border: 1px solid ${colors.Grey};
`;

export const Row = styled.tr`
  height: 35px;
  &:not(:last-child) {
    border-bottom: 1px solid ${colors.Grey};
  }
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

export const DataCell = styled.td`
  text-align: left;
  color: ${colors.DarkGrey};
  padding: 0 10px;
  font-size: 0.71rem
`;

export const CheckboxStyle = styled.div`
  height: 40px;
  @media (max-width: 1498px) {
    height: 77px;
  }
  @media (max-width: 1260px) {
    height: 97px;
  }
  @media (max-width: 1224px) {
    height: 117px;
  }
  @media (max-width: 1110px) {
    height: 137px;
  }
  @media (max-width: 996px) {
    height: 157px;
  }
`;
