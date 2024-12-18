import styled from 'styled-components';

import { MagnifyingIcon } from '../../icons';
import { colors } from '../../styles/colors';

export const Container = styled.div`
padding: 5px;
position: relative;
width: 100%;
border-color: ${colors.Grey};
border-style: solid;
border-width: 1px;
border-radius: 4px;
margin-bottom: 10px;
transition: all 0.2s ease-in-out;
&:focus-within {
  border-color: ${colors.LightBlue};
}
`;

export const Base = styled.input`
background-color: transparent;
outline: none;
padding: 4px 0;
border: 0;
transition: all 0.2s ease-in-out;
width: 100%;
font-size: 0.8em;
max-width: calc(100% - 30px);
/* to get ride of the yellow color in chrome*/
&:-webkit-autofill,
&:-webkit-autofill:hover,
&:-webkit-autofill:focus,
&:-webkit-autofill:active {
  transition: background-color 5500s ease-in-out 0s;
  -webkit-box-shadow: inset 0 0 0 500px transparent;
}
`;

export const SearhcIcon = styled(MagnifyingIcon)`
right: 10px;
position: absolute;
top: 8px;
`;
