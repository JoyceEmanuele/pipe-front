import { Link } from 'react-router-dom';
import styled, { css, keyframes } from 'styled-components';

const marquee = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
`;

export const ButtonOptions = styled.div<{ disabled?: boolean }>(
  ({ disabled }) => `
  padding: 5px;
  display: flex;
  gap: 5px;
  min-width: 97px;
  flex-direction: row;
  height: max-content;
  justify-content: space-around;
  align-items: center;
  text-align: center;
  border-radius: 11px;
  border: 1px solid;
  border-color: #e3e3e3;
  cursor: pointer;

    ${disabled && `
    opacity: 0.5;
    cursor: not-allowed;
  `}
`,
);

export const ButtonArrow = styled.button`
  background-color: transparent;
  border: none;
  display: flex;
  justify-content: center;
  width: 40px;
  height: 50px;
  align-items: center;
`;

export const DataExportRow = styled.div`
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
`;

export const ResultsResume = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  gap: 40px;

  border-radius: 9px;
  border: 1px solid rgba(232, 232, 232, 1);
  background-color: #f9f9f9;

  width: 100%;
  min-height: 120px;
  height: auto;
  flex-wrap: wrap;
  p{
    text-align: center;
  }
`;

export const UnitLink = styled(Link)`
  color: #000000;
  font-family: Inter;
  font-size: 12px;
  font-weight: 400;
  text-decoration: underline;
  &:hover {
    color: inherit;
    text-decoration: none;
  }
`;

export const ResultContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  position: relative;
`;

export const ContainerTooltip = styled.div`
  background-color: white;
  width: 150px;
  .tooltip_white {
    color: 'black';
    background-color: white;
    width: 150px;
  }
`;

export const IconWrapper = styled.div`
  display: inline-block;
  width: 14px;
  height: 14px;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  svg {
    width: 12px;
    height: 12px;
  }
`;

export const ColumnTotalValues = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  b {
    margin-bottom: 4px;
    font-size: 12px;
  }
`;

export const ContainerButtonOpen = styled.div`
  position: absolute;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;
  z-index: 12;
  bottom: -29px;
  min-width: 97px;
  border: 1px solid #E3E3E3;
  border-radius: 0px 0px 11px 11px;
  background: #FFFFFF;
  padding: 5px;
  overflow-x: hidden;
  gap: 5px;
  height: max-content;
  width: 100%;
  cursor: pointer;
`;

export const ContainerProg = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  cursor: pointer;
  padding: 0px 12px;
  .tooltip-white {
  background-color: white !important; /* Garante que a cor dentro do tooltip será branca */
  color: #333; /* Isso ajusta a cor de fundo do tooltip se necessário */
}
.tooltip-white::after {
  background-color: white !important;
}
`;

export const PopoverContentDevAut = styled.div`
  font-size: 11px;
  &:after {
    content: '';
    position: absolute;
    top: 90%; /* Coloca a seta logo abaixo do elemento pai */
    left: 50%; /* Centraliza a seta horizontalmente */
    transform: translateX(-50%); /* Ajusta o centro da seta */
    border-width: 5px;
    border-style: solid;
    border-color: white transparent transparent transparent; /* Seta com a ponta voltada para cima */
  }
`;

export const PopoverContainerDevAut = styled.div`
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  padding: 20px;

  border-radius: 9px;
  border: 1px solid #e3e3d3;
  box-shadow: 0px 2px 8px rgba(62, 71, 86, 0.2);
  width: 160px;
  background: white;
`;

export const SelectOptionStyled = styled.button<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;

  height: 41px;
  width: 100%;

  border: none;
  background: transparent;
  padding: 10px;

  border-left: 5px solid transparent;

  ${({ selected }) => selected
    && css`
      background-color: #363BC4;
      color: white;
      &:hover {
        background-color: #363BC4;
      }
    `}
    ${({ selected }) => !selected
    && css`
      &:hover {
        background-color: #363bc44f;
      }
    `}
`;
