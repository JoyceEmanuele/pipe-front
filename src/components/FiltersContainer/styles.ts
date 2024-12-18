import styled, { css } from 'styled-components';
import { colors } from '~/styles/colors';

export const Filters = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 5px 5px;
  height: 32px;
  border: 1px solid lightgray;
  border-radius: 15px;
  white-space: nowrap;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  width: 100%;
`;

export const BtnOrderColumns = styled.div`
  cursor: pointer;
  padding: 0 10px;
  border: 1px solid lightgrey;
  font-weight: 500;
  border-radius: 10px;
  box-shadow: 0 2px 4px 1px rgba(0, 0, 0, 0.1);
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  height: 40px;
  gap: 10px;
  &:hover {
    color: ${colors.BlueSecondary};
  }
`;

export const BtnActionFilters = styled.div<{isActive?: boolean}>`
  display: flex;
  gap: 8px;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  background: #FFFFFF;
  border: 1px solid #E0E0E0;
  border-radius: 20px;
  color: #000;
  font-family: Inter;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;

  ${({ isActive }) => !isActive
        && css`
          cursor: not-allowed;;
      `}
`;

export const BtnFiltersWrapper = styled.div`
  position: relative;
`;

export const BtnFilters = styled.div<{isActive?: boolean}>`
  display: flex;
  gap: 8px;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  background: #F2F2F2;
  border-radius: 20px;
  color: #000;
  font-family: Inter;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  &:hover {
    color: ${colors.BlueSecondary};
  }

  ${({ isActive }) => !isActive
        && css`
        svg {
          cursor: not-allowed;;
        }
      `}
`;

export const BtnFiltersDropdown = styled.div`
  position: absolute;
  top: 125%;
  background: #FFFFFF;
  border-radius: 5px;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.1);
  max-height: 270px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: scroll;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  z-index: 99;
  div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    span {
      color: #000;
      font-family: Inter;
      font-size: 11px;
      font-weight: 400;
    }
  }
`;

export const BtnBasic = styled.div<{isActive?: boolean}>`
  ${({ isActive }) => !isActive
      && css`
      svg {
        cursor: not-allowed;;
      }
    `}
`;
