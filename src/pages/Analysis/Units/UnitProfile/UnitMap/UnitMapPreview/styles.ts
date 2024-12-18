import styled from 'styled-components';
import { ModalWindow } from '~/components';
import { colors } from '~/styles/colors';

export const UnitMapPreviewStyled = styled.div`
  width: 269px;
  height: 161px;

  display: flex;
  flex-direction: column;
  align-items: center;

  overflow: hidden;

  border-radius: 8px;
  border: 1px solid #D7D7D7;

  box-shadow: 0px 5px 5px 0px rgba(0, 0, 0, 0.08);
`;

export const UnitMapPreviewHeaderStyled = styled.div`
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  padding: 17px 17px 8px 17px;

  div {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  svg {
    cursor: pointer;
  }

  h2 {
    margin: 0;

    color: #000;

    font-family: Inter;
    font-size: 11px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const UnitMapContentStyled = styled.div`
  height: 119px;
  width: 269px;

  position: relative;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &:hover{
    .overlay {
      opacity: 0.9;
    }
  }
`;

export const UnitMapContentImgStyled = styled.div`
  height: 100%;
  width: 100%;

  overflow: hidden;
  padding: 8px 17px 17px 17px;

  display: flex;
  align-items: center;
  justify-content: center;

  img {
    max-width: 100%;
    max-height: 100%;

    object-fit: contain;
  }
`;

export const UnitMapContentOverlayStyled = styled.div`
  height: 100%;
  width: 100%;

  position: absolute;

  opacity: 0;
  background-color: rgba(54, 59, 196, 1);

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  span {
    color: #FFF;

    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }
`;

export const TooltipContainer = styled.div`
  display: flex;
  flex-direction: column;

  > span {
    font-size: 9px;
    line-height: 11px;
    color: #656565;
  }

  > strong {
    font-size: 10px;
    line-height: 12px;
  }
`;

export const DeleteModal = styled(ModalWindow)`
  display: flex;
  gap: 8px;

  padding: 40px;

  min-width: unset;
  width: 370px;

  h2 {
    font-size: 12px;
    font-family: Inter;
    font-weight: 700;
    color: ${colors.Black};
    line-height: 14.52px;

    margin: 0;
  }

  span {
    font-size: 12px;
    font-family: Inter;
    font-weight: 400;
    color: #4A4A4A;
    line-height: 14.52px;

    margin: 0;
  }

  p {
    font-size: 12px;
    font-family: Inter;
    font-weight: 400;
    color: #4A4A4A;
    line-height: 14.52px;

    margin: 0;

    span {
      color: #E00030;
    }
  }
`;

export const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .header {
    display: flex;
    flex-direction: column;
    margin-top: 4px;
  }
`;

export const DeleteModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  a {
    font-size: 10px;
    font-family: Inter;
    font-weight: 600;
    color: #4B4B4B;
    line-height: 12.52px;

    text-decoration: underline;
  }

  button {
    width: 45%;

    font-size: 10px;
    font-family: Inter;
    font-weight: 600;
    line-height: 12.52px;
  }
`;
