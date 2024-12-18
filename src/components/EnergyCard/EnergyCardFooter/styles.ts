import styled from 'styled-components';
import { Button } from '~/components';
import { colors } from '~/styles/colors';

export const CardContentFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  span{
    font-family: Inter;
    font-size: 10px;
    font-style: normal;
    font-weight: 400;

    color: rgba(0, 0, 0, 0.56);
  }

  button {
    width: max-content;

    color: #363BC4;
    font-size: 9px;
    border-color: #363BC4;
    border-radius: #363BC4;

    padding: 5px 10px 5px 10px;

    background: white;
  }
`;

export const InsightsFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  p {
    color: #000000;
    font-family: Inter;
    font-size: 11px;
    font-style: normal;
    font-weight: 700;
    line-height: 13.31px;

    margin: 0;
  }
  span {
    max-width: 300px
  }
`;

export const ShowListButton = styled(Button)`
  border: 1px solid ${colors.BlueSecondary};
  box-sizing: border-box;
  border-radius: 3px;
  padding: 5px 10px;
  font-weight: bold;
  font-size: 9px;
  text-align: center;
  color: ${colors.BlueSecondary};
  cursor: pointer;
  align-self: end;
  z-index: 99;
`;

export const LoaderOverlay = styled.div`
  position: absolute;
  top: 0;

  background-color: #ffffff;
  opacity: 0.7;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  width: 100%;
  height: 100%;
`;
