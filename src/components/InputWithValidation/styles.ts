import { color } from 'html2canvas/dist/types/css/types/color';
import styled from 'styled-components';

import { colors } from 'styles/colors';

const defineLabelColor = (disabled) => {
  if (disabled) {
    return colors.Grey200;
  }
  return colors.Blue700;
};

export const BaseSpan = `
  color: ${colors.Blue700};
  font-size: 0.75em;
  font-weight: bold;
  top: 8px;
`;

export const Base = styled.input<{ suffixLength? }>(
  ({ suffixLength }) => `
    border: none;
    outline: none;
    min-height: 48px;
    font-size: 1em;
    border-radius: 5px;
    padding: 20px ${suffixLength ? `${suffixLength * 9}px` : '35px'} 10px 14px;
    color: ${colors.Black};
    width: 100%;
    border: 0.7px solid ${colors.GreyInputBorder};

    &:focus {
      color: ${colors.Black}
    }

    &::placeholder {
      font-size: 12px;
      color: ${colors.GreyInputPlaceholder};
    }
    ::-webkit-inner-spin-button{
      -webkit-appearance: none; 
      margin: 0; 
    }
    ::-webkit-outer-spin-button{
        -webkit-appearance: none; 
        margin: 0; 
    }    
`,
);

export const Container = styled.div`
  position: relative;
  border-radius: 5px;
`;

export const Label = styled.label<{ disabled, value, suffixLength?, noSuffixBorder? }>(
  ({
    disabled,
    value,
  }) => `
    position: relative;
    display: inline-block;
    width: 100%;
    cursor: ${disabled ? 'not-allowed' : 'default'};
    span:first-of-type {
      color: ${defineLabelColor(disabled)};
      transition: 0.2s all ease-in-out;
      font-size: 1em;
      left: 15px;
      font-weight: bold;
      font-size: 12px;
      position: absolute;
      cursor: auto;
      ${value ? BaseSpan : 'top: calc(50% - 20px);'}
    }

    span:nth-child(3) {
      position: absolute;
      width: auto;
      padding: 5px;
      font-size: 12px;
      font-weight: 400;
      line-height: 1;
      color: #818181;
      right: 10px;
      top: calc(50% - 12px);
      border: 1px solid #ccc;
      white-space: nowrap;
      vertical-align: middle;
      border-radius: 5px;
      &:hover{
        background-color: #f8f8f8;
      }
    }

    &:focus-within {
      span:first-of-type {
        ${BaseSpan}
      }
    }
  `,
);

export const TextInfo = styled.div<{status}>(({ status }) => `
  color: ${status ? colors.Green : colors.Red};
  display: block;
  margin: 5px;
  text-align: left;
  font-size: 0.75em;
  padding-top: 2px;
`);

export const IconWrapper = styled.div`
  display: inline-block;
  width: 15px;
  height: 15px;
  cursor: pointer;
  position: relative;
  svg {
    width: 15px;
    height: 15px;
  }
`;

export const TextInfoLoading = styled.div`
  color: ${colors.Grey300};
  display: block;
  margin: 5px;
  text-align: left;
  font-size: 0.75em;
  padding-top: 2px;
`;
