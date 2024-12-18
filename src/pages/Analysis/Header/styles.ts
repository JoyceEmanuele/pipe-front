import { NavLink, Link } from 'react-router-dom';
import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const Wrapper = styled.div`
display: flex;
flex-direction: column;
`;

export const Content = styled.div`
display: flex;
align-items: center;
overflow-x: auto;
overflow-y: hidden;
margin: 5px 5px 0 5px;
padding: 0;
height: 30px;
max-width: 100%;
border-bottom: 1px solid ${colors.Grey100};
margin: 0px;
justify-content: space-between;
@media (max-width: 1240px) {
  height: 41px;
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
margin-bottom: -1px;
li:not(:first-child) {
  margin-left: 32px;
}
.active {
  color: ${colors.Blue300}; // texto nav maior
}
`;

export const StyledList2 = styled.ul`
display: flex;
flex-direction: row;
align-items: center;
justify-content: flex-start;
list-style: none;
padding: 0;
margin-left: 32px;
margin-bottom: 0px;
.active {
  color: ${colors.Blue300};
}
`;

export const StyledItem = styled.li`
display: flex;
align-items: center;
justify-content: center;
flex-direction: column;
white-space: nowrap;
gap: 5px;
`;

export const StyledLink = styled(NavLink)`
color: ${colors.Grey500};
font-size: 13px;
font-weight: bold;
text-decoration: none;
  :hover {
    color: ${colors.Blue300};
  }
`;

export const StyledLink2 = styled(Link)<{ isActive: boolean }>(({ isActive }) => `
color: ${isActive ? colors.Blue300 : colors.Grey500};
font-size: 13px;
font-weight: bold;
text-decoration: none;
  :hover {
    color: ${colors.Blue300};
  }

`);

export const StyledLine = styled.div<{ isActive }>(
  ({ isActive }) => `
background: ${isActive ? colors.Blue300 : 'transparent'};
width: 100%;
height: 10px;
animation: grow .5s;
border-radius: 3px 3px 0px 0px;

@keyframes grow {
  from {
    width: 0;
  }
  to{
    width: 100%;
  }
}
  @media (max-width: 1233px) {
    height: 7px;
    margin-top: 3px;
  }
`,
);
