import styled from 'styled-components';
import { colors } from '~/styles/colors';

export const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 220px;
  height: 220px;
  border: 1px solid #E4E4E4;
  border-radius: 4px;
  margin-right: 20px;
  margin-top: 10px;
`;

export const BorderTop = styled.div`
  height: 10px;
  background-color: ${colors.BlueSecondary};
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
`;

export const TooltipContainer = styled.div`
  display: flex;
  flex-direction: column;

  background-color: #ffffff;

  font-family: 'Inter';
  font-size: 12px;
  line-height: 11px;

  div {
    display: flex;
    justify-content: space-between;

    div {
      display: flex;
      flex-direction: column;
    }
  }

  strong {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  span {
    margin: 0;
    padding: 2px 0;
  }
`;

export const ProgWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  svg {
    width: 22px;
    height: 22px;
  }
`;

export const ButtomStatus = styled.div`
display: flex;
min-width: 190px;
height: 37px;
justify-content: center;
align-items: center;
border: 1px solid rgba(208, 208, 208, 0.37) ;
border-radius: 10px;
box-shadow: 0px 4px 4px 0px rgba(0,0,0,0.06);
`;

export const ButtomStatusOn = styled.div`
display: flex;
min-width: 190px;
height: 42px;
justify-content: center;
align-items: center;
border-radius: 10px 10px 0px 0px;
border-top: 1px solid rgba(208, 208, 208, 0.37);
border-left: 1px solid rgba(208, 208, 208, 0.37);
border-right: 1px solid rgba(208, 208, 208, 0.37);
`;

export const ButtomStatusOff = styled.div`
display: flex;
min-width: 190px;
height: 42px;
justify-content: center;
align-items: center;
border-radius: 0px 0px 10px 10px;
border-bottom: 1px solid rgba(208, 208, 208, 0.37);
border-left: 1px solid rgba(208, 208, 208, 0.37);
border-right: 1px solid rgba(208, 208, 208, 0.37);
`;

export const ModalStatusDivisor = styled.div`
width: 100%;
height: 1px;
background-color: rgba(228, 227, 227, 1);
`;

export const ModalStatus = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  z-index: 3;
`;
