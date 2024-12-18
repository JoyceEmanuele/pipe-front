import styled from 'styled-components';
import { ModalWindow } from '~/components';

export const UnitMapModalViewStyled = styled(ModalWindow)`
  width: 906px;

  padding: 0;
`;

export const UnitMapModalViewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 17px;

  & > div {
    display: flex;
    gap: 8px;
  }

  .mapName {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  h2 {
    color: #000;

    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;

    margin: 0;
  }

  p {
    color: #000;

    font-family: Inter;
    font-size: 11px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;

    margin: 0;
  }

  button {
    width: 20%;
  }
`;
