import styled from 'styled-components';
import { colors } from '../../styles/colors';

export const ModalContent = styled.div`
  z-index: 100000;
  background-color: #fefefe;
  padding: 20px;
  border: 1px solid #888;
  min-width: 400px;
  margin-top: 40px;
  border-radius: 10px;
  overflow: auto;
  max-height: 95%;
`;

export const ModalContentWithBorderTop = styled.div`
  z-index: 1000000;
  background-color: #fefefe;
  padding: 20px;
  width: 22rem;
  border-top: 12px solid ${colors.A350};
  margin-top: 40px;
  border-radius: 10px;
  overflow: auto;
  max-height: 95%;
  @media (max-width: 460px) {
    width: 18rem;
  }
  @media (max-width: 340px) {
    width: 16rem;
  }
`;

export const ModalBackground = styled.div`
  display: flex; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 900; /* Sit on top */
  left: 0;
  top: 0;
  width: 100vw; /* Full width */
  height: 100vh; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
  align-items: center;
  justify-content: center;
  @media (min-width: 768px) {
    padding-top: 40px;
    padding-left: 90px;
  }
`;

export const LabelInfo = styled.span`
  color: #202370;
  font-weight: bold;
  font-size: 14px;
  @media (max-width: 400px) {
    font-size: 9px;
  }
`;

export const LabelData = styled.span`
  font-weight: bold;
  font-size: 14px;
  @media (max-width: 400px) {
    font-size: 9px;
  }
`;

export const LabelSwitch = styled.span`
  font-size: 14px;
  @media (max-width: 400px) {
    font-size: 9px;
  }
`;

// export const ModalContent = styled.div`
//   background-color: #fefefe;
//   margin: 15% auto; /* 15% from the top and centered */
//   padding: 20px;
//   border: 1px solid #888;
//   width: 400px;
// `

// export const Modal = styled.div`
//   display: block; /* Hidden by default */
//   position: fixed; /* Stay in place */
//   z-index: 1; /* Sit on top */
//   left: 0;
//   top: 0;
//   width: 100%; /* Full width */
//   height: 100%; /* Full height */
//   overflow: auto; /* Enable scroll if needed */
//   background-color: rgb(0, 0, 0); /* Fallback color */
//   background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
// `
