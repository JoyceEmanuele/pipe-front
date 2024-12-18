import styled from 'styled-components';
import {
  Select,
} from 'components';

export const Card = styled.div`
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;

export const IrTable = styled.div`
  display: grid;
  border-left: 1px solid grey;
  border-bottom: 1px solid grey;
`;

export const IrTableCell = styled.div`
  border-top: 1px solid grey;
  border-right: 1px solid grey;
  padding: 5px;
  display: flex;
  align-items: center;
`;

export const IrTableCell2 = styled(IrTableCell)`
  justify-content: space-between;
`;

export const SelectContainer = styled.div`
  font-weight: bold;
  position: fixed;
  background: white;
  border: 2px solid #d3d3d3;
  border-radius: 10px;
  box-shadow: 5px 6px 11px rgba(0,0,0,0.24), 0px 14px 15px rgba(0,0,0,0.12);
`;

export const CustomSelect = styled(Select)`
  margin-bottom: 20px;
  background-color: white;
  margin-bottom: 0;
`;

export const TextLine = styled.div`
  display: flex;
  align-items: center;
  color: #5d5d5d;
  margin-top: 10px;
`;
