import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { colors } from '../../styles/colors';

export const TopLink = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 11px;
  line-height: 13px;
  color: ${colors.Black};
  margin-top: 3px;
  text-decoration: underline;
`;

export const TopTitle = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 13px;
  line-height: 16px;
  color: ${colors.Black};
  align-items: center;
  display: flex;
`;

export const ExpandButton = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.32);
  border-radius: 3px;
  font-weight: bold;
  font-size: 16px;
  color: ${colors.BlueSecondary};
  width: 26px;
  text-align: center;
  margin: auto;
  cursor: pointer;
`;

export const ItemTitle = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 13px;
  color: ${colors.Black};
`;

export const ItemSubTitle = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  color: ${colors.Black};
`;

export const ItemValue = styled.div`
  display: flex;
  align-items: baseline;
  white-space: nowrap;
  margin-left: 30px;
`;

export const ItemValueCurrency = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: 100;
  font-size: 22px;
  letter-spacing: 0.5px;
  color: ${colors.GreyDark};
`;

export const ItemValueInt = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  letter-spacing: 0.5px;
  color: ${colors.GreyDark};
`;

export const ItemValueDecimal = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.5px;
  color: ${colors.GreyDark};
`;

export const ChevronDown = styled.span`
  margin-left: 20px;
  ::before {
    border-style: solid;
    border-width: 0.17em 0.17em 0 0;
    content: '';
    display: inline-block;
    height: 0.50em;
    left: 0.15em;
    position: relative;
    top: 13px;
    -webkit-transform: rotate(135deg);
    -ms-transform: rotate(135deg);
    transform: rotate(135deg);
    vertical-align: top;
    width: 0.50em;
  }
`;

export const StyledLink = styled(Link)`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 11px;
  line-height: 13px;
  color: ${colors.Black};
  margin-top: 3px;
  text-decoration: underline;
`;

export const StyledButton = styled(Link)`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 11px;
  line-height: 13px;
  text-align: center;
  text-decoration: none;
  color: #FFFFFF;
  background: #202370;
  border-radius: 3px;
  padding: 7px;
`;

export const MenorConsumo = styled.span`
  width: 15px;
  height: 5px;
  background: #C6C7EC;
  border-radius: 3px;
  display: inline-grid;
  margin-left: 4px;
`;

export const MedioConsumo = styled.span`
  width: 15px;
  height: 5px;
  background: #7074E8;
  border-radius: 3px;
  display: inline-grid;
  margin-left: 4px;
`;

export const MaiorConsumo = styled.span`
width: 15px;
height: 5px;
background: ${colors.BlueSecondary};
border-radius: 3px;
display: inline-grid;
margin-left: 4px;
`;

export const BarColor = styled.span`
width: 15px;
height: 5px;
border-radius: 3px;
display: inline-grid;
margin-left: 4px;
`;

export const StatusButtonOn = styled.div`
font-family: Inter;
font-style: normal;
font-weight: bold;
font-size: 11px;
line-height: 13px;
color: #FFFFFF;
background: #202370;
padding: 5px 20px;
width: fit-content;
margin: auto;
`;

export const StatusButtonOff = styled.div`
font-family: Inter;
font-style: normal;
font-weight: bold;
font-size: 11px;
line-height: 13px;
color: #FFFFFF;
background: #BBBBBB;
padding: 5px 20px;
width: fit-content;
margin: auto;
`;

export const CustomLegendUl = styled.ul`
transform: rotate(90deg);
position: relative;
left: -80px;
top: -55px;
`;

export const CustomLegendLi = styled.li`
font-family: Inter;
font-style: normal;
font-weight: 400;
font-size: 11px;
color: #000000;
list-style-type: none;
display: inline-flex;
align-items: center;
`;

export const LegendIcon = styled.div`
width: 15px;
height: 4px;
background: #E00030;
border-radius: 2px;
margin-left: 10px;
`;

export const SeparationLine = styled.div`
width: 100%;
border: 1px solid #c3c3c3;
margin-top: 10px
`;
