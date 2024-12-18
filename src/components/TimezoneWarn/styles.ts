import styled, { keyframes } from 'styled-components';

export const ContainerTimezoneWarn = styled.div`
    background-color: rgba(241, 241, 241, 1);
    color: rgba(119, 129, 139, 1);
    font-size: 12px;
    font-weight: 500;
    border-radius: 9px;
    width: 70%;
    max-width: 500px;
    padding: 2px;
    margin-bottom: 10px;
    text-align: center;
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const noOp = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 1;
  }
`;

export const ContainerTimezoneDST = styled.div`
    background-color: rgba(241, 241, 241, 1);
    color: rgba(119, 129, 139, 1);
    font-size: 12px;
    font-weight: 500;
    width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 22px;
    border-radius: 6px;
    text-align: center;
    .__react_component_tooltip {
      z-index: 1000;
    }
  .tooltip-show {
    animation: ${fadeOut} 3s ease-in-out forwards;
  }
  animation: ${noOp} 3s ease-in-out forwards;
`;
