import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const StyledSpan = styled.span`
display: flex;
flex-direction: column;
text-align: center;
margin-top: 5px;
`;

export const MapCard = styled.div`
border-radius: 16px;
overflow: hidden;
`;

export const PopupContainer = styled.div`
display: flex;
flex-direction: column;
`;

export const Title = styled.span`
font-weight: bold;
`;

export const DesktopWrapper = styled.div`
display: none;
@media (min-width: 768px) {
  display: block;
}
`;

export const MobileWrapper = styled.div`
display: block;
@media (min-width: 768px) {
  display: none;
}
`;

export const ModalMobile = styled.div<{ isModalOpen }>(
  ({ isModalOpen }) => `
display:${isModalOpen ? 'block' : 'none'};
position: fixed;
top: 0;
left: 0;
background-color: ${colors.White};
width: 100%;
height: 100vh;
z-index: 1;
overflow: hidden;
transition: all .5s ease-in-out;
`,
);

export const ModalTitle = styled.span`
font-weight: bold;
font-size: 1.25em;
line-height: 27px;
color: ${colors.Grey400};
`;

export const ModalTitleContainer = styled.div`
display: flex;
justify-content: space-between;
align-items: center;
height: 100%;
width: 100%;
padding: 16px;
svg {
  cursor: pointer;
}
`;

export const ModalSection = styled.div`
width: 100%;
height: 80px;
background: ${colors.Grey030};
border-bottom: 2px solid ${colors.Grey100};
box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.3);
`;

export const ControlFilter = styled.div`
  border: 1px solid #E9E9E9;
  border-radius: 5px;
  background-color: #ffffff;
  padding: 6px 10px;
  user-select: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  z-index: 1;
  &:hover {
    cursor: pointer;
    background-color: ${colors.BlueSecondary};
    color: white;
    svg path {
      fill: white !important;
    }
  }
`;

export const Label = styled.label`
  position: relative;
  display: inline-block;
  width: 100%;
  margin-left: 16px;
  margin-right: 16px;
  color: #202370;
  font-size: 11px;
  font-weight: bold;
`;

export const ContainerSearch = styled.div`
  width: 100%;
  padding-top: 3;
  padding-bottom: 3;
  min-width: 80px;
  border: 1px solid #E9E9E9;
  max-width: 200px;
  border-radius: 3px;
  background-color: #ffff;
  margin-left: 10px;
  margin-bottom: 10px;
  width: 220px;
  padding: 3px;

  @media (max-width: 770px) {
    min-width: 100%;
    justify-content: space-between;
    margin: 0;
    margin-bottom: 10px;
  }
`;
