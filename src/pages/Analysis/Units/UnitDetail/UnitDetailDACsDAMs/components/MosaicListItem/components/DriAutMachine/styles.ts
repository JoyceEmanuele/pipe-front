import styled from 'styled-components';
import { Select as DropdownMenu } from '~/components';
import {
  Base, List, ListItem, SelectedLabel, Wrapper,
} from '~/components/Select/styles';
import { colors } from '~/styles/colors';
import { Link } from 'react-router-dom';

const getStatusColor = (isPrimary: boolean, status: number) => {
  if (isPrimary) {
    if (status === 1) {
      return { background: '#363BC4', border: '#363BC4', font: '#FFFFFF' };
    }

    return { background: '#B8B8B8', border: '#B8B8B8', font: '#FFFFFF' };
  }

  if (status === 1) {
    return { background: '#FFFFFF', border: '#3DD598', font: '#3DD598' };
  }

  return { background: '#FFFFFF', border: '#FF5454', font: '#FF5454' };
};

export const Container = styled.div`
display: flex;
flex-direction: column;
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

export const Label = styled.strong`
font-size: 15px;
line-height: normal;
font-weigth: bold;
margin: 5px 0 5px 0;
`;

export const Status = styled.div`
display: flex;
flex-direction: column;
`;

export const SetPointRow = styled.div`
display: flex;
flex-direction: row;  
justify-content: space-between;
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

export const DevStatusContainer = styled.div`
border: solid 2px;
border-radius: 8px;
margin-top; 6px;
width: 50%;
`;

export const DevStatus = styled.div`
display: flex;
flex-direction: column;
align-items: center;
text-align: center;
`;

export const TempSetPoint = styled.div`
border: solid 1px ${colors.GreyInputBorder};
border-radius: 5px;
display: flex;
flex-direction: row;
align-items: center;
justify-content: space-around;
padding: 5px;
width: 100px;
height: 30px;
margin-top: 2px;
`;

export const Arrows = styled.div`
display: flex;
flex-direction: column;
height: 27px;
justify-content: space-around;
`;

export const TransparentLink = styled(Link)`
display: flex;
flex-direction: column;
padding-top: 7px;
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

export const StatusContainer = styled.div`
  display: flex;
  margin-top: 4px;
  min-width: 160px;
  gap: 6px;
  align-items: center;
`;

export const IconWiFiRealTime = styled.div`
display: flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;


  svg {
    width: 16px;
    height: 16px;
  }
`;

export const StatusBox = styled.div<{ isPrimary: boolean, status: number, dat?: boolean }>`
  width: 80px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;

  border: 1px solid ${({ isPrimary, status, dat }) => (dat ? '#B8B8B8' : getStatusColor(isPrimary, status).border)};
  background-color: ${({ isPrimary, status, dat }) => (dat ? '#FFFFFF' : getStatusColor(isPrimary, status).background)};
  border-radius: 4px;

  color: ${({ isPrimary, status, dat }) => (dat ? '#B8B8B8' : getStatusColor(isPrimary, status).font)};
  font-weight: bold;
  font-size: 9px;
  text-transform: uppercase;
`;
