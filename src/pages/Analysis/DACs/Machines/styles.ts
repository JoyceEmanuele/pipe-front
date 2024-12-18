import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const WrapperDesktop = styled.div`
display: none;
@media (min-width: 768px) {
  display: block;
}
`;

export const WrapperMobile = styled.div`
display: block;
@media (min-width: 768px) {
  display: none;
}
`;

export const HealthWrapper = styled.div(
  ({ color }) => `
display: flex;
span {
  margin-left: 6px;
  color ${color};
  font-weight: bold;
  font-size: 0.875em;
  line-height: 18px;
  text-align: center;
  white-space: nowrap;
}
`,
);

export const StyledLink = styled(Link)`
color: ${colors.Grey400};
word-break: normal;
`;

export const StyledSpan = styled.span`
color: ${colors.Grey400};
word-break: normal;
`;

export const SearchInput = styled.div`
min-height: 48px;
margin: 0;
font-size: 12px;
margin-left: 16px;
margin-bottom: 5px;
color: #000;
width: 100%;
border: 1px solid #E9E9E9;
border-radius: 5px;
box-sizing: border-box !important;
display: inline-flex;
align-items: center;
`;

export const Label = styled.label`
position: relative;
display: inline-block;
width: 100%;
margin-top: 6px;
margin-left: 16px;
margin-right: 16px;
color: #202370;
font-size: 11px;
font-weight: bold;
`;

export const BtnClean = styled.div`
  cursor: pointer;
  color: ${colors.BlueSecondary};
  margin-top: 7px;
  margin-left: 10px;
  text-decoration: underline;
  font-size: 11px;
`;

export const BtnInput = styled.button`
display: flex;
align-items: center;
justify-content: center;
background-color: white;
width: 32px;
height: 30px;
margin-right: 10px;

border: 1px solid  rgba(0, 0, 0, 0.15);
cursor: pointer;
border-radius: 5px;
box-shadow: 0 0.3em 0.3em rgba(0, 0, 0, 0.09);
transition: all 0.5s ease-in;
&:hover {
   background-color: rgba(0, 0, 0, 0.05);
  cursor: pointer;
  }
`;
