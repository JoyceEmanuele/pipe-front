import styled, { css, keyframes } from 'styled-components';
import { colors } from '~/styles/colors';

const fadeInAnimation = keyframes`
  0% {
    opacity: 0;
  }
  15% {
    opacity: 0;
  }
  100% {
    opacity: 1;
    z-index: 1;
  }
`;

const slideDownAnimation = keyframes`
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  50% {
    opacity: 0;
    transform: translateY(100%);
    visibility: hidden;
  }
  100% {
    opacity: 0;
    visibility: hidden;
  }
`;

const slideOutAnimation = keyframes`
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  50% {
    opacity: 0;
    transform: translateX(100%);
    visibility: hidden;
  }
  100% {
    opacity: 0;
    visibility: hidden;
  }
`;

export const Container = styled.div`
  width: 100vw;
  display: flex;
  overflow: hidden;
  position: relative;

  img {
    width: 130px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const BackgroundContainer = styled.div`
  height: 100vh;
  width: 55%;
  padding: 19rem 12rem;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  

  @media (max-width: 1212px) {
    padding: 19rem 10rem;
  }

  @media (max-width: 1018px) {
    padding: 19rem 6rem;
  }

  @media (max-width: 768px) {
    height: 300px;
    width: 100%;
    padding: 3.25rem 2.5rem;
  }
`;

export const MainContentContainer = styled.div`
  height: 100vh;
  width: 45%;
  position: relative;

  @media (max-width: 768px) {
    height: 500px;
    width: 100%;
  }
`;

export const ComponentContainer = styled.div<{ isLoading: boolean }>`
  background: ${colors.White};
  height: 100%;
  width: 75%;
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  padding: 0 3.7rem;
  right: 0;

  img {
    width: 100px;
  }

  @media (max-width: 768px) {
    height: 100%;
    width: 100vw;
    gap: 30px;
    padding: 1.5rem 3.75rem;

    ${({ isLoading }) => isLoading
      && css`
        animation-duration: 3s;
        animation-name: ${slideDownAnimation};
        animation-fill-mode: forwards;
      `}
  }

  ${({ isLoading }) => isLoading
    && css`
      animation-duration: 3s;
      animation-name: ${slideOutAnimation};
      animation-fill-mode: forwards;
    `}
`;

export const WelcomeText = styled.div`
  color: #fff;
  p {
    margin: 0;
  }

  .welcome {
    font-family: Inter;
    font-size: 30px;
    font-style: normal;
    font-weight: 400;
    line-height: 39px;
    margin-bottom: 10px;
  }

  .diel {
    font-family: Inter;
    font-size: 41px;
    font-style: normal;
    font-weight: 800;
    line-height: 39px;
  }
  img {
    width: 100%;
    max-width: 400px;
  }
  @media (max-width: 934px) {
    img {
      width: 300px;
    }
  }
  @media (max-width: 347px) {
    img {
      width: 200px;
    }
  }
`;

export const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  span {
    color: ${colors.BlueSecondary};
    font-family: Inter;
    font-size: 10px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    text-decoration-line: underline;

    cursor: pointer;
  }

  p {
    color: #313131;
    font-family: Inter;
    font-size: 9px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }

  img {
    cursor: pointer;
  }
`;

export const ProgressContainer = styled.div<{ isLoading: boolean }>`
  height: 100%;
  width: 100%;
  z-index: -1;
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 7rem;

  p {
    color: ${colors.White};
    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 39px;
  }

  @media (max-width: 768px) {
    width: 100vw;
    padding: 0 2rem;
  }

  ${({ isLoading }) => isLoading
    && css`
      animation-duration: 2s;
      animation-name: ${fadeInAnimation};
      animation-fill-mode: forwards;
    `}
`;

export const CreditPowered = styled.div`
  font-size: 11px;
  color: white;
  gap: 5px;
  display: flex;
  align-items: center;
  img {
    width: 40px;
  }
`;
