import styled from 'styled-components';

import { colors } from '~/styles/colors';

const defineLabelColor = (error, disabled) => {
  if (error) {
    return colors.Red;
  }
  if (disabled) {
    return colors.Grey200;
  }
  return colors.Blue700;
};

export const InputContainer = styled.div`
  height: 50px;
  border: 1px solid ${colors.GreyInputBorder};
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 8px;
  position: relative;
`;

export const Input = styled.input`
  font-size: 14px;
  height: 20px;
  padding: 10px 5px 5px 0px;
  border: none;
  width: 90%;
  outline: none;
  color: ${colors.Black};
  margin-left: 5px;
  margin-top: 15px;
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

export const Error = styled.span`
  color: ${colors.Red};
  display: block;
  margin: -10px 5px 10px 5px;
  text-align: left;
  font-size: 0.75em;
  height: 24px;
`;

export const Label = styled.label<{ error, disabled }>(
  ({ error, disabled }) => `
    position: absolute;
    display: inline-block;
    top: 5px;
    z-index: -1;
    left: 12px;
    width: 100%;
    cursor: ${disabled ? 'not-allowed' : 'default'};
    span {
      color: ${defineLabelColor(error, disabled)};
      transition: 0.2s all ease-in-out;
      font-weight: bold;
      font-size: 12px;
      font-weight: bold;
      cursor: auto;
    }
  `,
);
