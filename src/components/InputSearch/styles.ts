import styled from 'styled-components';

import { colors } from '../../styles/colors';

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
const styledInput = `
border: none;
outline: none;
min-height: 48px;
font-size: 1em;
border-radius: 8px;
padding: 25px 40px 10px 14px;
color: ${colors.Grey400};
width: 100%;
&::placeholder {
  color: transparent;
}
`;

const BaseSpan = `
color: ${colors.Blue300};
font-size: 0.75em;
font-weight: bold;
top: 6px;
`;
export const Base = styled.input<{ error?: string }>(
  ({ error }) => `
${styledInput}
border: ${error ? `1px solid ${colors.Red}` : 'none'};
box-shadow: 0px 2px 1px rgba(0, 0, 0, 0.1);
&:focus {
  color: ${colors.Grey400}
  box-shadow: 0px 7px 12px rgba(83, 104, 111, 0.12), 0px 11px 15px rgba(85, 97, 115, 0.1);
}
`,
);
export const Container = styled.div<{ error?: string }>(
  ({ error }) => `
position: relative;
border-radius: 8px;
${error ? `border-color: ${colors.Red};` : ''}
`,
);
export const Label = styled.label<{ error?: string, disabled?: boolean, value: string }>(
  ({ error, disabled, value }) => `
position: relative;
display: inline-block;
width: 100%;
cursor: ${disabled ? 'not-allowed' : 'default'};
span {
  color: ${error ? colors.Red : disabled ? colors.Grey200 : colors.Grey300};
  transition: 0.2s all ease-in-out;
  font-size: 1em;
  left: 15px;
  position: absolute;
  ${
  value
    ? BaseSpan
    : `
      top: calc(50% - 12px);
    `
}
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
margin: 0;
text-align: left;
font-size: 0.75em;
height: 24px;
`;
