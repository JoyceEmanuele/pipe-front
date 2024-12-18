import { color } from 'html2canvas/dist/types/css/types/color';
import styled from 'styled-components';

import { colors } from 'styles/colors';

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
  color: ${colors.Blue300};
  font-size: 0.75em;
  font-weight: bold;
  top: 6px;
`;

export const Base = styled.input<{ error, suffixLength? }>(
  ({ error, suffixLength }) => `
    border: none;
    outline: none;
    min-height: 48px;
    font-size: 1em;
    border-radius: 5px;
    padding: 20px ${suffixLength ? `${suffixLength * 9}px` : '35px'} 10px 14px;
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

export const Container = styled.div`
  position: relative;
  border-radius: 5px;
`;

export const Label = styled.label<{ error, disabled, value, suffixLength? }>(
  ({
    error,
    disabled,
    value,
    suffixLength,
  }) => `
    position: relative;
    display: inline-block;
    width: 100%;
    cursor: ${disabled ? 'not-allowed' : 'default'};
    span:first-of-type {
      color: ${defineLabelColor(error, disabled)};
      transition: 0.2s all ease-in-out;
      font-size: 1em;
      left: 15px;
      font-weight: bold;
      font-size: 12px;
      position: absolute;
      cursor: auto;
      ${value ? BaseSpan : 'top: calc(50% - 18px);'}
    }

    span:nth-child(3) {
      position: absolute;
      width: auto;
      padding: 5px;
      font-size: 12px;
      font-weight: 400;
      line-height: 1;
      color: ${colors.Grey300};
      left: ${`calc(100% - ${suffixLength * 9}px)`};
      top: calc(50% - 4px);
      background-color: #eee;
      border: 1px solid #ccc;
      white-space: nowrap;
      vertical-align: middle;
      border-radius: 5px;
    }

    &:focus-within {
      span:first-of-type {
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

export const SetpointButton = styled.div<{ up?: boolean, down?: boolean, disabled?: boolean }>`
  flex-basis: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #D7D7D7;
  user-select: none;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  ${({ up }) => (up ? 'border-bottom: 1px solid #D7D7D7' : '')}
  ${({ down }) => (down ? 'border-top: 1px solid #D7D7D7' : '')}
`;

export const IconWrapper = styled.div`
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-top: 7px;
  margin-right: 3px;
  cursor: pointer;
  position: relative;
  top: -10px;
  svg {
    width: 8px;
    height: 8px;
  }
`;

export const CustomInput = styled.div`
  min-height: 48px;
  margin: 0;
  font-size: 12px;
  color: #000;
  border: 1px solid #E9E9E9;
  border-radius: 5px;
  box-sizing: border-box !important;
  display: inline-flex;
  border: 0.7px solid ${colors.GreyInputBorder}
`;

export const PlaceholderWrapper = styled.div`
  display: inline-block;
  width: 52px;
  height: 18px;
  margin-top: 19px;
  margin-right: 4px;
  font-size: 11px;
  color: #818181;
  background-color: #F2F0F0;
  text-align: center;
  align-items: center;
  justify-content: center;
  position: relative;
  svg {
    width: 18px;
    height: 18px;
  }
`;
