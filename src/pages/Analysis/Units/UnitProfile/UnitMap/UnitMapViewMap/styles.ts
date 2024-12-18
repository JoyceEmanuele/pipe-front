import styled, { css } from 'styled-components';

export const UnitMapViewMapHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 22px;

  .mapName {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  & > div {
    display: flex
    gap: 8px
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

  span {
    color: #000;

    font-family: Inter;
    font-size: 11px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }
`;

export const UnitMapViewMapFooter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 22px;
  padding: 17px

  a {
    color: #363BC4;

    font-family: Inter;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;

    text-decoration: underline;
  }

  button {
    width: 25%;
  }
`;

export const SelectSearchStyled = styled.div`
  .select-search__options {
    margin: 0;
  }

  .select-search__select {
    border-radius: 0 3px 3px 3px !important;
  }

  .select-search__row {
    border-top: 1px solid #eee !important;
  }
`;

export const SelectOptionStyled = styled.button<{ selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;

  height: 41px;
  width: 100%;

  border: none;
  background: transparent;
  padding: 0 8px;

  border-left: 5px solid transparent;

  ${({ selected }) => selected
    && css`
      border-left: 5px solid #363BC4;
    `}
`;

export const SelectedContent = styled.div`
  width: 80%;

  text-align: start;

  p{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    margin: 0;
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    margin: 0;

    color: #363BC4;
    text-decoration: underline;
    cursor: pointer;
  }
`;
