import styled from 'styled-components';

import { colors } from '../../styles/colors';

export const TableContainer = styled.table<{ verifyMobile: boolean }>`
  ${({ verifyMobile }) => (verifyMobile ? `
    @media (max-width: 1170px) {
      display: block;
      overflow-y: hidden;
      overflow-x: auto;
    }
  ` : `
  `)}
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
  border-radius: 10px;
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
word-break: normal;
border-bottom: solid 1px ${colors.Grey};
text-align: left;
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
font-size: 0.71rem;
word-break: normal;
`;

export const CardsRow = styled.tr`
background-color: #F3F3F3;
box-shadow: 1px 1px 1px 1px #CECECE;
`;

export const DataCellCard = styled.td.attrs({
  colSpan: 10,
})`
text-align: left;
color: ${colors.DarkGrey};
padding: 0 10px;
font-size: 0.71rem;
word-break: normal;
`;

export const ClickableSpan = styled.span`
cursor: pointer;
`;
