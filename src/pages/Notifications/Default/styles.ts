import styled from 'styled-components';
import { colors } from '~/styles/colors';

export const SearchInput = styled.div`
  min-height: 48px;
  margin: 0;
  font-size: 12px;
  margin-left: 16px;
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

export const IconWrapperSearch = styled.div`
display: inline-block;
width: 18px;
height: 18px;
margin-top: 15px;
margin-right: 15px;
svg {
  width: 18px;
  height: 18px;
}
`;

export const ButtonAdd = styled.button`
  border-radius: 5px;
  border-style: solid;
  border-width: 1px;
  cursor: pointer;
  font-size: 1em;
  font-family: 'Open Sans', sans-serif;
  font-weight: bold;
  outline: none;
  padding: 12px;
  text-decoration: none;
  text-transform: uppercase;
  transition: all 0.2s ease-in-out;
  width: 1;
  color: ${colors.White};
  transition: all 0.3s ease-in-out;
  border-radius: 10px;
  background-color: ${colors.Blue300};
  border-color: ${colors.Blue300};
  justify-content: right;

  :hover {
    background-color: ${colors.BlueMenu};
    border-color: ${colors.BlueMenu};
  }
`;
