import { DatePicker } from 'antd';
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

export const BaseSpan = `
  font-size: 0.75em;
  font-weight: bold;
  top: 5px;
`;

type BaseProps = {
  error?: string;
}

export const Base = styled(DatePicker).attrs((props: BaseProps) => ({
  style: {
    border: `0.7px solid ${props.error ? colors.Red : colors.GreyInputBorder}`,
    borderRadius: 5,
    minHeight: 48,
    outline: 'none',
    boxShadow: 'none',
  },
}))`
  font-size: 1em;
  padding: 20px 35px 10px 14px;
  color: ${colors.Grey400};
  width: 100%;

  .ant-picker-input input {
    margin-top: 14px;
    margin-left: 2px;

    ::placeholder {
      font-size: 12px;
      color: ${colors.GreyInputPlaceholder};
    }
  }
`;

export const Container = styled.div`
  position: relative;
`;

export const Label = styled.label<{ error, disabled, value, focused }>(
  ({
    error, disabled, value, focused,
  }) => `
    position: absolute;
    top: 2px;
    z-index: 5;
    display: inline-block;
    width: 100%;
    cursor: ${disabled ? 'not-allowed' : 'default'};

    span {
      color: ${defineLabelColor(error, disabled)};
      transition: 0.2s all ease-in-out;
      font-size: 1em;
      left: 15px;
      font-weight: bold;
      font-size: 12px;
      position: absolute;
      cursor: auto;
      ${value || focused ? BaseSpan : 'top: 5px;'}
    }
  `,
);

export const Error = styled.span`
  color: ${colors.Red};
  display: block;
  margin: -2px 5px;
  text-align: left;
  font-size: 0.75em;
  height: 24px;
`;
