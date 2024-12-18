import styled from 'styled-components';

import { colors } from '../../styles/colors';

export const TopTitle = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 13px;
  line-height: 16px;
  color: ${colors.Black};
`;

export const TopDate = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 11px;
  line-height: 24px;
  text-align: right;
  letter-spacing: -0.5px;
  color: ${colors.GreyDark};
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
  margin-right: 4px;
  word-break: normal;
`;

export const ItemValue = styled.div`
  display: flex;
  align-items: baseline;
  white-space: nowrap;
`;

export const ItemValueCurrency = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: 200;
  font-size: 15px;
  letter-spacing: 0.5px;
  color: ${colors.GreyDark};
`;

export const ItemValueUnit = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: 300;
  font-size: 14px;
  letter-spacing: 0.5px;
  color: ${colors.GreyDark};
  margin-left: 2px;
`;

export const ItemVal = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: 700;
  font-size: 21px;
  letter-spacing: 0.5px;
  color: ${colors.Black};
`;

export const NoInformation = styled.div`
  display: flex;
  align-items: center;
  font-weight: 600;
  color: ${colors.GreyDark};
`;

export const LabelObs = styled.div`
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  color: rgba(0, 0, 0, 0.6);
`;

export const Overlay = styled.div`
  position: absolute;
  display: flex;
  background-color: #eceaea;
  width: 100%;
  height: 100%;
  z-index: 10000000;
  opacity: 0.4;
  filter: alpha(opacity=40);
  top: 0;
  left: 0;
`;
