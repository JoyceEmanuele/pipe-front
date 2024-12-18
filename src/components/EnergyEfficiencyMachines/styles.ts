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
`;

export const ItemSubTitle = styled.div`
font-family: Inter;
font-style: normal;
font-weight: normal;
font-size: 9px;
color: ${colors.Black};
`;

export const ItemValue = styled.div`
display: flex;
align-items: baseline;
white-space: nowrap;
`;

export const ItemValueInt = styled.div`
font-family: Inter;
font-style: normal;
font-weight: bold;
font-size: 27px;
letter-spacing: 0.5px;
color: ${colors.GreyDark};
`;

export const TootipTexName = styled.div`
font-family: Inter;
font-weight: 600;
font-size: 12px;
`;

export const TootipTexValue = styled.div`
font-family: Inter;
font-size: 11px;
`;

export const TootipTex = styled.div`
font-family: Inter;
font-size: 9px;
`;

export const CardLine = styled.div`
width: 100%;
border: 0.5px solid rgba(0,0,0,0.2);
margin-top: 23px;
`;

export const ZeroConsumo = styled.span`
width: 15px;
height: 5px;
background: #CCCCCC;
border-radius: 3px;
display: inline-grid;
margin-left: 4px;
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
