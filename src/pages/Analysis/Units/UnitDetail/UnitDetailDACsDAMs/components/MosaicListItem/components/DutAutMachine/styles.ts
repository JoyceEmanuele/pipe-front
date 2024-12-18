import styled from 'styled-components';
import { Select as DropdownMenu } from '~/components';
import {
  Base, List, ListItem, SelectedLabel, Wrapper,
} from '~/components/Select/styles';
import { colors } from '~/styles/colors';
import { Link as RouterLink } from 'react-router-dom';

export const Container = styled.div`
display: flex;
flex-direction: column;
padding-top: 7px;
`;

export const SelectedInput = styled(DropdownMenu)`
${Base} {
  height: 30px;
  min-height: 0;
  width: 112px;
}
${Wrapper} {
  height: 30px;
}
${SelectedLabel} {
  margin-top: 0;
}
${List} {
  overflow-y: hidden;
}
${ListItem} {
  &:hover {
    background-color: ${colors.Blue300};
    span {
      color: ${colors.White};
    }
  }
}
`;

export const Link = styled.div`
font-size: 10px;
line-height: 7.5px;
color: #363bc4;
text-decoration: underline;

padding-top: 10px;

cursor: pointer;
`;

export const Label = styled.strong`
font-size: 15px;
line-height: normal;
font-weigth: bold;
margin: 5px 0 5px 0;
`;

export const Temperature = styled.div`
text-align: center;
display: flex;
flex-direction: column;
`;

export const Status = styled.div`
display: flex;
flex-direction: column;
`;

export const SetPointRow = styled.div`
display: flex;
flex-direction: row;
justify-content: space-between;
align-items: flex-end;
width: 100%;
`;

export const SetPoint = styled.div`

`;

export const ArrowUp = styled.div`
line-height: 0;
`;

export const ArrowDown = styled.div`
line-height: 0;
`;

export const TempSetPoint = styled.div`
display: flex;
flex-direction: row;
align-items: center;
justify-content: flex-start;
width: 80px;
height: 30px;
margin-top: 2px;
`;

export const Arrows = styled.div`
display: flex;
flex-direction: column;
height: 27px;
justify-content: space-around;
`;

export const TransparentLink = styled(RouterLink)`
display: flex;
flex-direction: column;
color: inherit;
text-decoration: inherit;
&:hover {
  color: inherit;
  text-decoration: inherit;
}
`;

export const MediumDiv = styled.div`
display: flex;
border: 1px solid grey;
opacity: 0.4;
width: 0px !important;
min-height: 100px !important;
margin: 20px
`;

export const IconWrapper = styled.div`
 svg {
  width: 27px;
  cursor: pointer;
  margin-left: 20px;
 }
`;

export const LabelDevice = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: #6d6d6d;

  /* padding: 8px 0 4px 0; */
  margin-bottom: 10px;
  cursor: pointer;
`;

export const Title = styled.strong`
  font-size: 13px;
  line-height: normal;

  /* margin-bottom: 5px; */
`;
