import styled from 'styled-components';

import { colors } from '../../../styles/colors';

const defineLabelColor = (error, disabled, readonly) => {
  if (error) {
    return colors.Red;
  }
  if (disabled) {
    return colors.Grey200;
  }
  if (readonly) {
    return '#8f91b7';
  }
  return colors.Blue700;
};

export const Container = styled.div`
  position: relative;
  border-radius: 5px;
  width: 100%;
`;

export const BaseSpan = `
  color: ${colors.Blue300};
  font-size: 0.75em;
  font-weight: bold;
  top: 6px;
`;

export const Base = styled.input<{ error }>(
  ({ error }) => `
    border: none;
    outline: none;
    min-height: 48px;
    font-size: 1em;
    border-radius: 5px;
    padding: 20px 35px 10px 14px;
    color: ${colors.Grey400};
    width: 100%;
    border: 0.7px solid ${error ? `${colors.Red}` : `${colors.GreyInputBorder}`}

    &:focus {
      color: ${colors.Grey400}
    }

    &::placeholder {
      font-size: 12px;
      color: ${colors.GreyInputPlaceholder};
    }
`,
);

export const Label = styled.label<{ error, disabled, isInputFilled, readonly }>(
  ({
    error, disabled, isInputFilled, readonly,
  }) => `
    position: relative;
    display: inline-block;
    width: 100%;
    cursor: ${disabled ? 'not-allowed' : 'default'};
    span {
      color: ${defineLabelColor(error, disabled, readonly)};
      transition: 0.2s all ease-in-out;
      font-size: 1em;
      left: 15px;
      font-weight: bold;
      font-size: 12px;
      position: absolute;
      cursor: auto;
      ${isInputFilled ? BaseSpan : 'top: calc(50% - 18px);'}
    }
    &:focus-within {
      span {
        ${BaseSpan}
      }
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
