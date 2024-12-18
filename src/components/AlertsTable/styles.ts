import styled from 'styled-components';

import { ExpandIcon } from '../../icons';
import { colors } from '../../styles/colors';

export const TableBox = styled.div`
  padding: 10px;
`;

export const Expand = styled(ExpandIcon)<{ expanded?: boolean }>`
  &:hover {
    cursor: pointer;
  }
  transform: rotate(${({ expanded }) => (expanded ? 180 : 0)}deg);
  transition: all 0.2s ease-in-out;
`;
export const Field = styled.span`
  width: 25%;
  height: 40px;
  font-size: 0.75em;
  line-height: 19px;
  color: #5d5d5d;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;
export const FieldDelete = styled(Field)`
  width: 10%;
`;
export const DataBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  border-bottom: 1px solid ${colors.DarkGrey70};
  padding-bottom: 4px;
  padding-top: 4px;
`;
export const HeaderItems = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex-direction: row;
  margin-bottom: 20px;
`;
export const ItemBox = styled.div`
  width: 25%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
`;
export const ItemBoxDelete = styled(ItemBox)`
  width: 10%;
`;
export const ItemName = styled.span`
  margin-right: 20px;
  font-size: 0.75em;
  color: #5d5d5d;
`;
export const CustomHr = styled.hr`
  margin-top: 36px;
  margin-bottom: 21px;
`;
export const EmptyMessage = styled.span`
  font-size: 0.875em;
  line-height: 16px;
  color: #5d5d5d;
`;
