import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { colors } from '../../styles/colors';

export const Line = styled.div`
  margin-top: 20px;
  margin-bottom: 5px;
  width: 100%;
  border: 0.5px solid rgba(0, 0, 0, 0.2);
`;

export const TopTitle = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 13px;
  line-height: 16px;
  color: ${colors.Black};
`;

export const ItemTitle = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 11px;
  color: ${colors.Black};
  word-break: normal;
`;

export const ItemSubTitle = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 9px;
  color: ${colors.Black};
  margin-top: 3px;
  word-break: normal;
`;

export const ItemValue = styled.div`
  display: flex;
  align-items: baseline;
  white-space: nowrap;
`;

export const ItemVal = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: 700;
  font-size: 21px;
  letter-spacing: 0.5px;
  color: ${colors.Black};
`;

export const ItemLegend = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 9px;
  color: ${colors.Black};
  margin-top: 3px;
  word-break: normal;
`;

export const ItemTitleCol = styled.div`
  font-weight: bold;
  font-size: 10px;
  color: ${colors.Blue700};
`;

export const ItemValueTR = styled.div`
  font-weight: 600;
  font-size: 8px;
  line-height: 10px;
  color: #969696;
`;

export const BtnList = styled.div`
  border: 1px solid ${colors.BlueSecondary};
  box-sizing: border-box;
  border-radius: 3px;
  padding: 5px 10px;
  font-weight: bold;
  font-size: 9px;
  text-align: center;
  color: ${colors.BlueSecondary};
  cursor: pointer;
`;

export const StyledLink = styled(Link)`
  color: ${colors.Black};
  font-weight: normal;
  font-size: 10px !important;
`;

export const CellLabel = styled.span`
  color: ${colors.Black};
  font-weight: normal;
  font-size: 10px !important;
`;

export const LabelFilter = styled.div`
  font-weight: bold;
  font-size: 9px;
  color: ${colors.BlueSecondary};
`;

export const OverLay = styled.div`
  position: absolute;
  display: flex;
  background-color: #eceaea;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0.4;
  filter: alpha(opacity=40);
  top: 0;
  left: 0;
`;
