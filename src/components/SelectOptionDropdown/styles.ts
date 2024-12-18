import styled, { css } from 'styled-components';

export const SelectOptionDropdownWrapper = styled.div`
  position: relative;
`;

export const Dropdown = styled.div`
  position: absolute;
  top: 115%;
  right: 0%;
  width: 190px;
  border: 1px solid #E3E3E3;
  border-radius: 5px;
  background: #FFFFFF;
  padding: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const DropdownHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
`;

export const DropdownContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-items: center;
`;

export const DropdownOption = styled.span<{ selected?: boolean; disabled?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 44px;
  font-family: Inter;
  border-radius: 5px;
  margin-bottom: 8px;
  font-family: Inter;
  font-size: 12px;
  font-weight: 500;
  color: black;

  cursor: pointer;

  ${({ disabled = false }) => disabled && css`
    background-color: rgba(142, 142, 142, 0.2);

    cursor: not-allowed;
  `}

  ${({ selected = false }) => selected && css`
    color: #FFFFFF;
    background-color: #363BC4;

    cursor: pointer;
  `}
`;

export const DropdownYearButtons = styled.div<{ disabled?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  border: 1px solid #E0E0E0;
  border-radius: 10px;
  width: 26px;
  height: 26px;

  path{
    fill: black;
  }

  cursor: pointer;

  ${({ disabled = false }) => disabled && css`
    cursor: not-allowed;

    path{
      fill: #B7B7B7
    }
  `}
`;
