import styled from 'styled-components';
import { colors } from '../../styles/colors';
import { Link } from 'react-router-dom';

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
  margin-right: 10px;
  letter-spacing: -0.5px;
  color: ${colors.GreyDark};
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

export const CellLabel = styled.span`
  color: ${colors.Black};
  font-weight: normal;
  font-size: 10px !important;
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

export const StyledLink = styled(Link)`
  color: ${colors.Grey400};
  margin: 0 8px 0 8px;
`;
