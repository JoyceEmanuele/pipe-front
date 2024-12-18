import styled from 'styled-components';

import { colors } from '../../../styles/colors';

export const Container = styled.div<{filterStyle}>(({ filterStyle }) => `
  position: relative;
  border-radius: 5px;
  ${filterStyle}
`);

const BaseSpan = `
  color: ${colors.Blue300};
  font-size: 0.85em;
  font-weight: bold;
  top: 4px;
`;

export const Base = styled.input<{ noBorder }>(({ noBorder }) => `
  border: none;
  outline: none;
  min-height: 41px;
  font-size: 1em;
  border-radius: 8px;
  padding: 10px 16px;
  color: ${colors.Grey400};
  width: 100%;
  max-width: 224px;
  ${!noBorder && `border: 0.7px solid ${colors.GreyInputBorder};`}

  &:focus {
    color: ${colors.Grey400}
  }

  &::placeholder {
    font-size: 12px;
    color: ${colors.GreyInputPlaceholder};
  }
`);

export const Label = styled.label<{ disabled, value, filterStyle, noBorder }>(
  ({
    disabled, value, filterStyle, noBorder,
  }) => `
    position: relative;
    display: inline-block;
    width: 100%;
    cursor: ${disabled ? 'not-allowed' : 'default'};
    ${filterStyle && 'border-radius: 5px;'}

    span {
      color: ${disabled ? colors.Grey200 : colors.Blue700};
      transition: 0.2s all ease-in-out;
      font-size: 1em;
      left: 15px;
      font-weight: bold;
      font-size: 11px;
      position: absolute;
      cursor: auto;
      ${value ? BaseSpan : 'top: calc(50% - 22px);'}
    }
    &:focus-within {
      span {
        ${BaseSpan}
      }
    }

    ${(filterStyle && !noBorder) && 'border: 1px solid #E9E9E9;'}
  `,
);

export const IconWrapper = styled.div`
  position: absolute;
  display: inline-block;
  width: 18px;
  height: 18px;
  right: 15px;
  top: calc(50% - 12px);

  svg {
    width: 18px;
    height: 18px;
  }
`;
