import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const Scroll = styled.div`
  overflow-x: auto;
`;

export const Container = styled.table`
  width: 100%;
`;

export const Head = styled.thead`
  text-align: left;
`;

export const Body = styled.tbody`
  overflow-x: scroll;
`;

export const HeaderCell = styled.th`
  padding: 0 10px;
  color: ${colors.DarkGrey};
  background-color: ${colors.White};
  border-bottom: solid 1px ${colors.Grey};
`;

export const HeaderTitle = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  justify-content: flex-start;
  position: relative;
  font-size: 0.75em;
`;

export const Data = styled.td`
  color: ${colors.DarkGrey};
  min-width: 100px;
  padding: 0 10px;
`;

export const Row = styled.tr`
  height: 50px;
  &:not(:last-child) {
    border-bottom: 1px solid ${colors.Grey};
  }
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;
