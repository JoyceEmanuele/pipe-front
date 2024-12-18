import styled, { keyframes } from 'styled-components';

export const Container = styled.div<{ size?: 'large'|'small' }>`
margin: 0 auto;
width: ${({ size }) => (size === 'small' ? 20 : 50)}px;
&:before {
  content: '';
  display: block;
}
`;

export const rotate = keyframes`
from {
  transform: rotate(0deg);
}

to {
  transform: rotate(360deg);
}
`;

export const dash = keyframes`
0% {
  stroke-dasharray: 1, 200;
  stroke-dashoffset: 0;
}
50% {
  stroke-dasharray: 89, 200;
  stroke-dashoffset: -35px;
}
100% {
  stroke-dasharray: 89, 200;
  stroke-dashoffset: -124px;
}
`;

export const Circular = styled.svg`
animation: ${rotate} 2s linear infinite;
height: 100%;
transform-origin: center center;
width: 100%;
margin: auto;
`;

export const Circle = styled.circle`
stroke-dasharray: 1, 200;
stroke-dashoffset: 0;
stroke-width: 2px;
animation: ${dash} 1.5s ease-in-out infinite;
stroke-linecap: round;
`;
