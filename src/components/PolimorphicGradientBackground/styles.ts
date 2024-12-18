import styled, { css, keyframes } from 'styled-components';
import polimorphicShapeGreen from '../../assets/img/polimorphic_shapes/polimorphic_shape_green.svg';
import polimorphicShapeLightBlue from '../../assets/img/polimorphic_shapes/polimorphic_shape_light_blue.svg';

const movePolimorphicLightBlue = keyframes`
  0%, 100% {
    transform: translateX(0%) translateY(0%) rotate(185deg);
  }
  20% {
    transform: translateX(5%) translateY(-10%) rotate(150deg);
  }
  40% {
    transform: translateX(10%) translateY(-20%) rotate(120deg);
  }
  60% {
    transform: translateX(15%) translateY(-30%) rotate(80deg);
  }
  80% {
    transform: translateX(20%) translateY(-20%) rotate(60deg);
  }
`;

const movePolimorphicShapeGreen = keyframes`
  0%, 100% {
    transform: translateX(0%) translateY(0%) rotate(275deg);
  }
  20% {
    transform: translateX(5%) translateY(-5%) rotate(250deg);
  }
  40% {
    transform: translateX(10%) translateY(-10%) rotate(220deg);
  }
  60% {
    transform: translateX(15%) translateY(-15%) rotate(190deg);
  }
  80% {
    transform: translateX(20%) translateY(-40%) rotate(275deg);
  }
`;

const gradientAnimation = keyframes`
  0% {
    background-position: 10% 95%;
  }
  50% {
    background-position: 100% 95%;
  }
  100% {
    background-position: 10% 95%;
  }
`;

export const GradientBackground = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(-45deg, #000000, #17195a, #363bc4);
  background-size: 150% 150%;
  top: 0;
  left: 0;

  @media (max-width: 768px) {
    min-height: 800px;
  }

  ${css`
    animation: ${gradientAnimation} 30s ease infinite;
  `}
`;

export const BackgroundChildreen = styled.div`
  position: absolute;
  top: 0;

  width: 100%;
  height: 100%;
`;

export const GradientsContainer = styled.div`
  filter: url(#goo) blur(40px);
  width: 100%;
  height: 100%;
`;

export const PolimorphicShapeGreen = styled.div`
  position: absolute;
  background-image: url(${polimorphicShapeGreen});
  height: 300%;
  width: 100%;
  background-size: 100% 100%;
  top: 0;
  right: 0;
  transform: translateX(-35%) translateY(0%) rotate(235deg);
  opacity: 1;

  ${css`
    animation: ${movePolimorphicShapeGreen} 15s linear infinite alternate;
  `}
`;

export const PolimorphicShapeLightBlue = styled.div`
  position: absolute;
  background-image: url(${polimorphicShapeLightBlue});
  width: 150%;
  height: 400%;
  right: -45%;
  bottom: -35%;
  background-size: 100% 100%;
  transform: translateY(0%) translateX(0%) rotate(185deg);
  transform-origin: center center;
  opacity: 1;

  ${css`
    animation: ${movePolimorphicLightBlue} 15s linear infinite alternate;
  `}
`;
