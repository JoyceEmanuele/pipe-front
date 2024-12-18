import styled, { css, keyframes } from 'styled-components';

const marquee = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

export const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
  cursor: pointer;
`;

export const TooltipText = styled.div<{ width?: string }>`
  visibility: hidden;
  background-color: white;
  color: #fff;
  text-align: center;
  border-radius: 5px;
  padding: 10px;
  position: absolute;
  z-index: 1;
  bottom: 115%; /* Ajuste conforme o posicionamento que deseja */
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s ease-out;
  border: 1px solid rgba(232, 232, 232, 1);
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  font-size: 13px;
  width: ${({ width }) => width || '300px'};

  &:after {
    content: '';
    position: absolute;
    top: 100%; /* Coloca a seta logo abaixo do elemento pai */
    left: 50%; /* Centraliza a seta horizontalmente */
    transform: translateX(-50%); /* Ajusta o centro da seta */
    border-width: 5px;
    border-style: solid;
    border-color: white transparent transparent transparent; /* Seta com a ponta voltada para cima */
  }
`;

export const MarqueeContainer = styled.div`
  height: 25px;
  overflow: hidden;
  position: relative;
`;

export const MarqueeContent = styled.div<{ contentWidth }>`
  display: block;
  white-space: nowrap;  // Ensure content stays on one line
  position: absolute;
  animation: ${marquee} 10s linear infinite;
`;

export const MarqueeText = styled.span`
  display: inline-block;
  color: black;
  margin: 0px 20px;
`;

export const TooltipWrapper = styled.div`
  &:hover ${TooltipText} {
    visibility: visible;
    opacity: 1;
  }
`;
