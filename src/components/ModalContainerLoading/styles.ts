import styled from 'styled-components';

export const ModalContainerLoading = styled.div<{display?: boolean }>`
  ${({ display }) => (display ? 'display: block' : 'display: none')}  
  padding-top: 20%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100vw;
  background-color: #fcfdfcd9;
  z-index: 1;
  position: absolute;
  left: 0;
  color: #5B5B5B;
  font-size: 14px;
  text-align: center;
  gap: 8px;
  cursor: wait;
  pointer-events: none;
  h4 {
    margin: 0px;
  }
`;
