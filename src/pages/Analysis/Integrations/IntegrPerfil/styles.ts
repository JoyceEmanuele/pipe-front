import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const InfoItem = styled.div`
width: 150px;
margin-right: 20px;
margin-bottom: 30px;
`;

export const TableNew2 = styled.table`
width: 100%;
white-space: nowrap;
border-collapse: collapse;
& tbody {
  & tr {
    height: 35px;
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
  & td {
    text-align: left;
    color: ${colors.DarkGrey};
    padding: 0 10px;
  }
}
& thead {
  & tr {
    height: 40px;
    display: table-row;
    border-bottom: solid 1px ${colors.Grey};
  }
  & th {
    flex: 1;
    text-align: left;
    align-items: center;
    padding: 0 10px;
    word-break: normal;
  }
}
`;

export const Title = styled.h1`
  font-size: 1.25em;
  color: #363BC4;
  font-weight: bold;
  margin-bottom: 16px;
`;

export const IconWrapper = styled.div`
  width: 100%;
  height: 27px;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    width: 25px;
    height: 19px;
  }
`;

export const StatusDevice = styled.div`
  border: 1px solid #D7D7D7;
  border-radius: 8px;
  padding: 10px 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  min-width: 260px;
  font-size: 12px;
`;
