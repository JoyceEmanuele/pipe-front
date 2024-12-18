import styled from 'styled-components';

import { colors } from 'styles/colors';

export const Wrapper = styled.button`
width: 40px;
height: 40px;
padding: 8px;
display: flex;
justify-content: center;
align-items: center;
border: 1px solid #D7D7D7;
border-radius: 10px;
background-color: ${colors.White};
&:hover {
  img {
    filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(103%) contrast(103%);
  }
  background-color: #363BC4;
}
cursor: pointer;
`;
