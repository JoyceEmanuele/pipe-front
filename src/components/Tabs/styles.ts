import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { colors } from '../../styles/colors';

export const Content = styled.div`
display: flex;
align-items: center;
padding: 0;
margin: 0;
height: 35px;
max-width: 100%;
justify-content: space-between;
border-bottom: 1px solid ${colors.Grey};
@media (max-width: 768px) {
  height: 50px;
  overflow-x: scroll;
}
`;

export const StyledList = styled.ul`
display: flex;
flex-direction: row;
align-items: center;
justify-content: flex-start;
list-style: none;
padding: 0;
li:not(:first-child) {
  margin-left: 12px;
}
`;

export const StyledItem = styled.li`
display: flex;
align-items: center;
justify-content: center;
flex-direction: column;
white-space: nowrap;
text-decoration: none;

`;

export const StyledLink = styled(Link)<{ isActive: boolean }>(({ isActive }) => `
color: black;
font-size: 14px;
font-weight: ${isActive ? 'bold' : 'none'};
text-decoration: none;
background-color: ${isActive ? colors.White : colors.Grey050};
width: 100%;
height: 100%;
padding: 8px 50px;
border-style: solid;
border-color: ${colors.Grey100};
border-width: 1px 1px 0;
border-radius: 5px 5px 0px 0px;
margin-top: 11px;
:hover{
  text-decoration: none;
  color: black;
}
`);
