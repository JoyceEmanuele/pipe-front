import styled from 'styled-components';
import { colors } from '~/styles/colors';

export const Card = styled.div`
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;

export const SearchInput = styled.div`
min-height: 48px;
margin: 0;
font-size: 12px;
margin-right: 16px;
margin-bottom: 5px;
color: #000;
width: 100%;
border: 1px solid #E9E9E9;
border-radius: 5px;
box-sizing: border-box !important;
display: inline-flex;
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

export const EnergyCardsWrapper = styled.div`
display: flex;
flex-wrap: wrap;
height: 450px;
border: 1px solid #D8D8D8;
border-radius: 10px;
margin-top: 20px;
margin-bottom: 20px;
padding: 20px 0px;
overflow: auto;
`;

export const EnergyCardsEmpty = styled.div`
display: grid;
margin: auto;
width: 250px;
text-align: center;
`;

export const EnergyNotifCardContainer = styled.div`
  border: 1px solid ${colors.GreyDefaultCardBorder};
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
  width: auto;
  min-width: 300px;
`;

export const Sidebar = styled.div<{active?: string}>`
  border-radius: 8px 0 0 8px;
  background-color: #363BC4;
  width: 15px;
`;

export const WeekDayButton = styled.div<{ checked: boolean }>`
  padding: 8px 10px;
  border-radius: 5px;
  margin: 5px;
  background-color: ${({ checked }) => (checked ? colors.BlueSecondary : 'lightgrey')};
  color: ${({ checked }) => (checked ? 'white' : 'black')};
`;
