import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const StyledLink = styled(Link)`
  color: ${colors.Grey400};
`;

export const StyledSpan = styled.span`
  color: ${colors.Grey400};
`;

export const FwVersTable = styled.div<{ limitSize, numCols }>(({ limitSize, numCols }) => `
  display: grid;
  grid-column-gap: 20px;
  grid-template-columns:${' auto'.repeat(numCols)};
  margin-top: 30px;
  ${limitSize ? 'max-height: 240px; overflow-y: hidden;' : ''}
`);
export const ViewMoreArrow = styled.p<{ viewMore }>(
  ({ viewMore }) => `
  span {
    font-size: 1em;
    color: ${colors.Grey400};
  }
  &:hover {
    cursor: pointer;
  }
  svg {
    margin-left: 12px;
    transition: all 0.2s;
    transform: rotate(${viewMore ? '-180' : '0'}deg);
  }
`,
);
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
