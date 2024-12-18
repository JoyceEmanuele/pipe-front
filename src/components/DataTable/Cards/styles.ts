import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const CardsContainer = styled.div`
display: flex;
flex-direction: row;
justify-content: space-between;
width: 100%;
`;

export const Card = styled.div`
width: 49%;
`;

export const Header = styled.div`
display: flex;
flex-direction: row;
justify-content: center;
`;

export const ColTitle = styled.div`
width: 115%;
padding: 6px;
padding-top: 8px;
cursor: pointer;
font-family: 'Inter';
font-style: normal;
font-weight: 700;
font-size: 11px;
line-height: 13px;
color: #777777;
`;

export const ColTitleCenter = styled.div`
width: 50%;
text-align: center;
padding: 6px;
padding-top: 8px;
cursor: pointer;
font-family: 'Inter';
font-style: normal;
font-weight: 700;
font-size: 11px;
line-height: 13px;
color: #777777;
`;

export const BodyList = styled.div`
overflow-y: auto;
display: flex;
flex-direction: column;
padding: 10px 7px 10px 10px;
max-height: 250px;
margin-bottom: 20px;
border: solid 1px #D7D7D7;
border-radius: 5px;
background-color: white;
`;

export const Row = styled.div`
display: flex;
flex-direction: row;
`;

export const Col = styled.div`
width: 115%;
padding-bottom: 2.5px;
display: flex;
flex-direction: column;
position: relative;
`;

export const ColCenter = styled.div`
width: 50%;
padding-bottom: 2.5px;
display: flex;
flex-direction: column;
text-align: center;
align-items: center;
justify-content: center;
`;

export const StyledLink = styled(Link)`
color: black;
font-family: 'Inter';
font-style: normal;
font-weight: 400;
font-size: 10px;
line-height: 12px;
text-decoration-line: underline;
max-width: 300px;
`;

export const TempColor = styled.div`
display: flex;
flex-direction: row;
align-items: center;
width: 55px;
justify-content: space-between;
`;

export const HealthIndexIcon = styled.div`
`;

export const HealthToolTipDiv = styled.div`
`;

export const ToolTipRowTitle = styled.div`
display: flex;
flex-direction: row;
align-items: center;
`;

export const ToolTipTitle = styled.div`
font-size: 11px;
font-weight: bold;
margin-left: 4px;
`;

export const SubTitle = styled.div`
font-size: 10px;
font-weight: bold;
padding-top: 11px;
text-align: left;
`;

export const HealthDesc = styled.div`
font-size: 10px;
max-width: 140px;
text-align: left;
`;

export const HealtLastAtt = styled.div`
text-align: left;
margin-top: 8px;
font-weight: bold;
font-size: 10px;
`;

export const ChevronTop = styled.span`
  border-style: solid;
  border-width: 0.25em 0.25em 0 0;
  content: '';
  display: inline-block;
  height: 0.45em;
  left: 0.15em;
  position: relative;
  top: 0.15em;
  transform: rotate(-45deg);
  vertical-align: top;
  width: 0.45em;
  margin-left: 10px;
  margin-top: 3px;
`;

export const ChevronBottom = styled.span`
  border-style: solid;
  border-width: 0.25em 0.25em 0 0;
  content: '';
  display: inline-block;
  height: 0.45em;
  left: 0.15em;
  position: relative;
  top: 0;
  transform: rotate(135deg);
  vertical-align: top;
  width: 0.45em;
  margin-left: 10px;
  margin-top: 3px;
`;

export const ButtonTypeSolution = styled.div<{ isClicked }>(
  ({ isClicked }) => `
  min-width: 93px;
  height: ${isClicked ? '30px' : '28px'};
  border-radius: 8px 8px 0px 0px;
  border: 1px solid #D7D7D7;
  border-bottom: 0px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${isClicked ? '#FFFFFF' : '#F4F4F4'};
  `,
);

export const ContainerNobreak = styled.div`
  position: relative;
  ::-webkit-scrollbar {
  width: 2px;
  }
`;

export const ContainerTypeOfSolutionsButton = styled.div`
  display: flex;
  z-index: 1;
  gap: 5px;
  position: absolute;
  top: -28px;
  max-width: 100%;
  /* overflow-x: scroll; */
  scrollbar-width: thin;
  ::-webkit-scrollbar {
    width: 12px;
    height: 10px;
  }
`;

export const NameStyle = styled.p`
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
  @media (max-width: 1300px) {
    max-width: 22ch;
  }
  @media (max-width: 1200px) {
    max-width: 25ch;
  }
  @media (max-width: 1516px) {
    max-width: 30ch;
  }
  @media (max-width: 1248px) {
    max-width: 20ch;
  }
`;
export const NameStyleNobreak = styled.p`
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
  @media (max-width: 1300px) {
    max-width: 15ch;
  }
  @media (max-width: 1200px) {
    max-width: 13ch;
  }
  @media (max-width: 1516px) {
    max-width: 10ch;
  }
  @media (max-width: 1024px) {
    max-width: 8ch;
  }
`;

export const ColNobreak = styled.div`
  width: 105%;
  padding-bottom: 2.5px;
  display: flex;
  flex-direction: column;
  position: relative;
  @media (max-width: 1524px) {
    width: 30%;
  }
`;
