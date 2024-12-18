import styled from 'styled-components';
import { colors } from 'styles/colors';
import { SelectMultiple } from 'components';

export const Table = styled.table`
  white-space: nowrap;
  & td,th {
    padding: 3px 10px;
    border: 1px solid grey;
  }
`;

export const FileInput = styled.label`
  border-radius: 32px;
  border-style: solid;
  border-width: 1px;
  cursor: pointer;
  font-size: 1em;
  font-family: 'Open Sans', sans-serif;
  font-weight: bold;
  outline: none;
  padding: 8px 0px;
  text-decoration: none;
  text-transform: uppercase;
  transition: all 0.2s ease-in-out;
  width: 100%;
  box-shadow: 0px 7px 12px rgba(83, 104, 111, 0.12), 0px 11px 15px rgba(85, 97, 115, 0.1);
  background-color: ${colors.Pink200};
  border-color: ${colors.Pink200};
  color: ${colors.White};
  transition: all 0.3s ease-in-out;
  &:hover {
    background-color: ${colors.Pink300};
    border-color: ${colors.Pink300};
    box-shadow: 0px 7px 12px rgba(83, 104, 111, 0.35), 0px 11px 15px rgba(85, 97, 115, 0.25);
  }
`;

export const CustomSelect = styled(SelectMultiple)`
  margin-bottom: 20px;
`;

export const BottonTypeSolution = styled.div<{ isClicked }>(
  ({ isClicked }) => `
  width: 149px;
  height: ${isClicked ? '35px' : '34px'};
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

export const PreFillGuideArea = styled.div`
  border: 1px solid #D7D7D7;
  position: relative;
`;

export const ContainerExportationAndDowload = styled.div`
  padding-left: 20px;
  h3 {
    font-size: 16px;
    padding-bottom: 10px;
  }
  h5 {
    font-size: 12px;
    font-weight: bold;
  }
  section {
    background: #F4F4F4;
    border-radius: 10px;
    padding: 20px 20px 20px 20px;
  }
`;

export const ContainerUnitMachine = styled.div`
  width: 100%;
  td {
    display: flex;
  }
  div:first-child {

  }
`;

export const StyleSelect = styled.div`
  min-height: 48px;
  margin: 0;
  font-size: 12px;
  color: #000;
  width: 100%;
  max-width: 500px;
  border: 1px solid #E9E9E9;
  border-radius: 5px;
  box-sizing: border-box !important;
  display: inline-flex;
`;

export const Label = styled.span`
  transition: all 0.2s;
  margin-top: -6px;
  margin-left: 16px;
  margin-right: 16px;
  color: ${colors.Blue700};
  font-size: 11px;
  font-weight: bold;
`;

export const CheckboxSelectAll = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  div {
    border: 1px solid gray;
    width: 10px;
    height: 10px;
  }
`;
