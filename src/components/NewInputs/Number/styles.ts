import styled from 'styled-components';

import { colors } from '../../../styles/colors';

export const InputLabel = styled.span`
  font-size: 12px;
  color: #4B4B4B;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const InputContainer = styled.div`
  height: 40px;
  width: 80px;
  border: 1px solid #CECECE;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: 5px;
`;

export const Input = styled.input`
  font-size: 16px;
  height: 35px;
  padding: 5px 5px 5px 10px;
  border: none;
  width: 60px;
  outline: none;
  font-weight: bold;
  color: ${colors.Blue700};
  ::-webkit-inner-spin-button{
      -webkit-appearance: none;
      margin: 0;
  }
  ::-webkit-outer-spin-button{
      -webkit-appearance: none;
      margin: 0;
  }
`;

export const CaretsContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

type CaretProps = {
  isDisabled: boolean;
}

export const Caret = styled.button<CaretProps>`
  background-color: #fff;
  border: none;
  cursor: ${(props) => (!props.isDisabled ? 'pointer' : 'not-allowed')};
  width: 14px;
  height: 14px;
  padding: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
