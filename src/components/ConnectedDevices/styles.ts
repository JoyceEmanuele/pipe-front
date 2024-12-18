import styled from 'styled-components';

import { colors } from '../../styles/colors';

export const NewCardPersonalized = styled.div`
  margin-bottom: 40px;
  margin-top: -18px;
  width: 100%;

  .cardContainer {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .margin-left {
    padding-left: 5px;
  }

  .margin-right {
    padding-right: 5px;
  }

  .disableBorder {
    border-right: 1px solid #E0E3E3;
    padding-right: 2%;
  }

  .boxShadow {
    box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.2);
  }


  @media(max-width: 995px) {
    display: flex;
    width: 100%;

    .wrapFlexContainer {
      /* card flex */
      display: flex;
      flex-wrap: wrap;


      .disableBorder {
        border-right: none;
      }
    }
  }
`;

export const ServerStyledBorder = styled.div`
  border: 3px solid #464555;
  border-radius: 4px;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 6px;
  margin-right: 3px;
  padding: 2px;

  img {
    width: 100%;
    height: 100%;
  }
`;

export const ContainerIconImage = styled.div`
  color: ${colors.Grey400};
  display: flex;
  flex-direction: row;
  align-items: center;

  img {
    width: 15%;
    height: 15%;
    margin-right: 5px;
  }

  strong {
    font-size: 12px;
    color: ${colors.Black};
    font-weight: 700;
    margin-right: 5px;
  }

  span {
    font-size: 12px;
    color: ${colors.Black};
  }
`;

export const ItemTitle = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 11px;
  color: ${colors.Black};
  word-break: normal;
`;

export const ItemSubTitle = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 9px;
  color: ${colors.Black};
  word-break: normal;
`;

export const ItemValue = styled.div`
  display: flex;
  align-items: baseline;
  white-space: nowrap;
`;

export const ItemVal = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: 700;
  font-size: 21px;
  letter-spacing: 0.5px;
  color: ${colors.Black};
`;

export const Overlay = styled.div`
  position: absolute;
  display: flex;
  background-color: #eceaea;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0.4;
  filter: alpha(opacity=40);
  top: 0;
  left: 0;
`;

export const TooltipContainer = styled.div`
  display: flex;
  flex-direction: column;

  span {
    font-size: 10px;
    color: ${colors.Black};
    font-weight: 700;
  }

  strong {
    font-size: 12px;
  }
`;

export const BoxHover = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 12.6px;
`;
