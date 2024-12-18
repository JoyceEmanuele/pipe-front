import { Input } from 'antd';
import styled from 'styled-components';

import { colors } from '../../../styles/colors';

const defineLabelColor = (error, disabled) => {
  if (error) {
    return colors.Red;
  }
  if (disabled) {
    return colors.Grey200;
  }
  return colors.Blue700;
};

export const BaseSpan = `
  color: ${colors.Blue700};
  font-size: 0.75em;
  font-weight: bold;
`;

type ContainerProps = {
  error?: string;
}

export const Container = styled.div<ContainerProps>`
  border-radius: 5px;
  border: 0.7px solid ${(props) => (props.error ? colors.Red : colors.GreyInputBorder)};
`;

export const Base = styled(Input.TextArea).attrs(() => ({
  rows: 4,
  style: {
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
    marginTop: -10,
  },
}))`
  ::placeholder {
    font-size: 12px;
    color: ${colors.GreyInputPlaceholder};
  }
`;

export const Label = styled.label<{ error, disabled, value, focused }>(
  ({
    error, disabled, value, focused,
  }) => `
    display: inline-block;
    width: 100%;
    cursor: ${disabled ? 'not-allowed' : 'default'};
    margin: 10px 12px;

    span {
      color: ${defineLabelColor(error, disabled)};
      transition: 0.2s all ease-in-out;
      font-size: 1em;
      left: 15px;
      font-weight: bold;
      font-size: 12px;
      cursor: auto;
      ${value || focused && BaseSpan}
    }
  `,
);

export const Error = styled.span`
  color: ${colors.Red};
  display: block;
  margin: 5px;
  text-align: left;
  font-size: 0.75em;
  height: 24px;
`;
