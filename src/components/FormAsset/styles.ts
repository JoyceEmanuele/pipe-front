import styled from 'styled-components';
import { colors } from '../../styles/colors';

export const CustomInput = styled.div`
  min-height: 48px;
  margin: 0;
  font-size: 12px;
  color: #000;
  width: 100%;
  border: 1px solid #E9E9E9;
  border-radius: 5px;
  box-sizing: border-box !important;
  display: inline-flex;
  border: 0.7px solid ${colors.GreyInputBorder}
`;

export const Label = styled.span`
  transition: all 0.2s;
  margin-top: -6px;
  margin-left: 16px;
  margin-right: 16px;
  color: ${colors.Blue700};
  font-size: 11px;
  font-weight: bold;
`;

export const IconWrapper = styled.div`
  display: inline-block;
  width: 22px;
  height: 22px;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  svg {
    width: 18px;
    height: 18px;
  }
`;

export const PlaceholderWrapper = styled.div`
  display: inline-block;
  width: 52px;
  height: 18px;
  margin-top: 19px;
  margin-right: 4px;
  font-size: 11px;
  color: #818181;
  background-color: #F2F0F0;
  text-align: center;
  align-items: center;
  justify-content: center;
  position: relative;
  svg {
    width: 18px;
    height: 18px;
  }
`;
