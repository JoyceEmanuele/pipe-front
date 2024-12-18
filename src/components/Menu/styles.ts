import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { colors } from 'styles/colors';
import { Button } from '../Button';

export const StyledLink = styled(Link)`
text-decoration: none;
width: 100%;
`;

export const Background = styled.div<{ isOpen }>(
  ({ isOpen }) => `
font-family: 'Inter', sans-serif;
display: flex;
flex-direction: column;
justify-content: flex-start;
align-items: center;
position: fixed;
top: 0;
left: 0;
height: 100%;
overflow-x: hidden;
width: ${isOpen ? '260px' : '70px'};
background-color: #363BC4;
z-index: 900;
overflow-y: auto;
p {
  color: gray;
  text-align: flex-start;
}
.active {
  background-color: #000125;
}
`,
);

export const Creditos = styled.div`
  margin-top: 40px;
  margin-bottom: 10px;
  font-size: 10px;
  color: white;
  padding: 0px 46px;
  strong {
    font-size: 14px;
  }
  font-size: 10px;
  color: white;
  img {
  width: 47px;
  height: 47px;
  margin-left: 2px;
  margin-bottom: 3px;
}
`;

export const LogoContainer = styled.div<{ isOpen }>(
  ({ isOpen }) => `
width: 100%;

margin-bottom: 5px;
padding-left: ${isOpen ? '40px' : '15px'};
div {
  display: flex;
  justify-content: space-between;
  margin-right: ${isOpen ? '35px' : '0px'};
  margin-left: ${isOpen ? '6px' : '2px'}
  img {
    margin-left: 0;
  }
}
`,
);

export const CustomLogo = styled.img`
margin-left: 5px;
margin-top: 50px;
margin-bottom: 40px;
cursor: pointer;
`;

export const CustomSpringerLogo = styled.img`
width: 120px;
margin-left: 10px;
margin-top: 50px;
margin-bottom: 40px;
cursor: pointer;
`;

export const MenuItem = styled.div<{ isActive, isOpen }>(
  ({ isActive, isOpen }) => `
box-sizing: border-box;
height: 35px;
white-space: pre;
display: flex;
align-items: center;
flex-direction: row;
cursor: pointer;
width: 100%;
position: relative;
padding: ${isOpen ? '25px 40px' : '25px 10px'};
background-color: ${isActive ? '#090B4B' : '#363BC4'};
&:hover {
  background-color: ${isActive ? '#090B4B' : '#3639a761'};
}
`,
);

export const MenuHighlight = styled.div<{ isActive }>(
  ({ isActive }) => `
visibility: ${isActive ? 'visible' : 'hidden'};
position: absolute;
width: 7px;
height: 35px;
padding: 24px 0;
right: 0px;
background: ${colors.GrenTab};
`,
);

export const MenuItemImg = styled.img`
width: 21.08px;
height: 20.69px;
margin-left: 7px;
`;
export const MenuItemName = styled.span`
position: relative;
font-size: 13px;
font-weight: 400;
text-align: center;
margin-left: 20px;
color: ${colors.White};
`;

export const MenuSubItemName = styled.span`
font-size: 13px;
font-weight: 400;
text-align: center;
color: ${colors.White};
/* margin-left: px; */
`;

export const BorderSubItem = styled.div`
border-left: 0.5px dashed rgba(255, 255, 255, 0.32);
height: 94%;
position: absolute;
left: 57px;
top: 0;
`;

export const SubItemMenu = styled.div<{ isActive }>(
  ({ isActive }) => `
box-sizing: border-box;
height: 0px;
display: flex;
align-items: center;
flex-direction: row;
cursor: pointer;
width: 100%;
padding: 25px 0 25px 59px;
background-color: ${isActive ? '#0F135F' : '#1A1D7C'};
&:hover {
  background-color: ${isActive ? '#0F135F' : '#17195A'};
  height: 35px;
}
 `,
);

export const ContainerSubItem = styled.div`
position: relative;
width: 100%;
`;

export const BorderHorizontalSubItem = styled.div`
width: 16px;
border: 0.5px dashed rgba(255, 255, 255, 0.22);
margin-right: 12px;
`;

export const InfoHeader = styled.div`
  text-align: start;
  width: 100%;
  color: #777BEB;
  min-height: 22px;
`;

export const MenuLinkActions = styled.span`
  color: ${colors.White};
  text-align: center;
  white-space: pre;
  font-size: 9px;
  font-weight: 400;
  margin-left: 45px;
  text-decoration-line: underline;
`;

export const ModalTitle = styled.span`
  text-align: right;
  font-size: 13px;
  font-weight: 700;
`;

export const ModalSubTitle = styled.p`
  font-size: 9px;
  font-weight: 400;
`;

export const AcceptationModalSubTitle = styled.p`
  font-size: 12px;
  font-weight: 400;
`;

export const ModalCancel = styled.p`
  font-size: 11px;
  color: ${colors.Blue500};
  text-decoration: underline;
  width: 100%;
  text-align: initial;
  margin-top: 8px;
  &:hover {
    color: ${colors.Blue400};
  }
`;

export const AcceptationModalButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 35px;
  font-size: 10px;
`;

export const HorizontalLine = styled.div`
  width: 100%;
  height: 1px;
  background: ${colors.Grey100};
  margin: 24px 0;
`;

export const NotificationBadge = styled.div< {menuToogle, isActive, isPlus}>(
  ({ menuToogle, isActive, isPlus }) => {
    const rightMenuToogle = isPlus ? '-25px' : '-18px';
    const rightNotMenuToogle = isPlus ? '0px' : '9px';
    const topMenuToogle = isPlus ? '-10%' : '5%';
    const topNotMenuToogle = '-11px';
    return `
  position: absolute;
  right: ${menuToogle ? rightMenuToogle : rightNotMenuToogle};
  top: ${menuToogle ? topMenuToogle : topNotMenuToogle};
  transform: translateY(-50%);
  background-color: #00FF9B;
  color:${isActive ? '#090B4B' : '#363BC4'};
  width:${isPlus ? '27px' : '15px'};
  height: 15px;
  border-radius:${isPlus ? '20px' : '50%'};
  font-size: 10px;
  font-weight: 700;
`; },
);
