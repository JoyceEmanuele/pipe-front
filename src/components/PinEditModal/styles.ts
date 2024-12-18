import styled, { css } from 'styled-components';
import { ModalWindow } from '../ModalWindow';

export const PinEditModalStyled = styled(ModalWindow)`
  display: flex;
  flex-direction: column;
  gap: 8px;

  width: 487px;

  overflow: visible;

  h2 {
    color: #000;

    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;

    margin: 0;
  }

  a {
    width: fit-content;

    color: #363BC4;

    font-family: Inter;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-decoration-line: underline;
  }
`;

export const PinEditModalContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const SearchInputWrapper = styled.div`
  width: 70%;
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
