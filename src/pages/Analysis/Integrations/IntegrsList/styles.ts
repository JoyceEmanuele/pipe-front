import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const StyledLink = styled(Link)`
  color: ${(props) => props.color ?? colors.Grey400};

  & + a {
    margin-right: 20px;
  }
`;

export const ExternalLink = styled.a`
  color: ${(props) => props.color ?? colors.Grey400};
  margin-right: 20px;
  text-decoration: none;
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
      text-align: left;
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
