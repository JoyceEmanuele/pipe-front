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

export const TempGreat = styled.span`
  width: 15px;
  height: 5px;
  background: ${colors.GreenLight};
  border-radius: 3px;
  display: inline-grid;
  margin-left: 4px;
`;

export const TempLow = styled.span`
  width: 15px;
  height: 5px;
  background: ${colors.BlueSecondary_v3};
  border-radius: 3px;
  display: inline-grid;
  margin-left: 4px;
`;

export const TempHigh = styled.span`
  width: 15px;
  height: 5px;
  background: ${colors.RedDark};
  border-radius: 3px;
  display: inline-grid;
  margin-left: 4px;
`;

export const NoTempData = styled.span`
  width: 15px;
  height: 5px;
  background: ${colors.Grey_v3};
  border-radius: 3px;
  display: inline-grid;
  margin-left: 4px;
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

export const LabelFilter = styled.div`
  font-weight: bold;
  font-size: 9px;
  color: ${colors.BlueSecondary};
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

export const TootipTexName = styled.div`
  font-family: Inter;
  font-weight: 600;
  font-size: 10px;
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

export const Dropdown = styled.div`
  box-shadow: 0px 2px 8px ${colors.Grey300};
  border-radius: 8px;
  position: absolute;
  top: 57px;
  width: 160px;
  height: 72px;
  padding: 5px 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  background-color: ${colors.White};
`;

export const DropdownItem = styled.a`
  color: ${colors.Grey300};
  cursor: pointer;
  color: #77818b;
  width: 100%;
  text-decoration: none;
  &:hover {
    background-color: ${colors.Grey050};
  }
`;

export const DropdownItemTitle = styled.span`
  margin-left: 10px;
`;
