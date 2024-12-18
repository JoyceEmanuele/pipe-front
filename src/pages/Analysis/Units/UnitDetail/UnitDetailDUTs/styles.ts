import { Link as LinkRouter } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { Card } from '~/components';
import { colors } from '~/styles/colors';

export const StyledSpan = styled.span`
  font-size: 1em;
  font-weight: bold;
  color: ${colors.Grey400};
`;

export const StyledCard = styled(Card)`
  margin-right: 24px;
`;

export const MachineCard = styled.div`
  display: block;
  width: 100%;
  min-width: 200px;
  padding: 16px 0;
`;
export const CardDetail = styled.div`
  display: flex;
  justify-content: space-around;
`;

export const InfoCard = styled.div`
  display: flex;
  min-width: 80px;
  height: 32px;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2em;
  font-weight: bold;
  white-space: nowrap;
  padding: 0 5px;
  color: ${colors.White};
  border-radius: 8px;
  background-color: ${colors.Grey300};
`;

export const InfoCardTemp = styled(LinkRouter)`
  text-decoration: none;
  display: flex;
  min-width: 80px;
  height: 32px;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2em;
  font-weight: bold;
  white-space: nowrap;
  padding: 0 5px;
  color: ${colors.White};
  border-radius: 8px;
  background-color: ${colors.Grey300};
`;

export const HeaderContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  align-items: flex-start;
  justify-content: space-between;

  .input-container {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    max-width: fit-content;

    > div {
      height: 50px;
      min-width: 250px;
    }

    > div + div {
      height: 50px;
    }
  }
`;

export const ViewModeButton = styled.button<{ isActive: boolean }>`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 90px;
  height: 32px;
  background-color: #ffffff;

  border: ${(props) => (props.isActive ? '2px solid #363bc4' : 0)};
  border-radius: 5px;

  font-size: 12px;
  font-weight: 600;
  color: ${(props) => (props.isActive ? '#363BC4' : '#7A7A7A')};

  > span {
    margin-right: 4px;
  }

  & + & {
    margin-left: 10px;
  }

  transition: filter 0.3s;

  &:hover {
    filter: brightness(0.9);
  }
`;

export const MosaicList = styled.div`
  display: flex;
  flex-flow: wrap;
  gap: 16px;

  max-height: 533px;
  width: 100%;
  margin-top: 26px;
  margin-bottom: 20px;
  padding: 30px 19px 30px 30px;
  border: 1px solid #d7d7d7;
  border-radius: 8px;

  overflow-y: scroll;
`;

export const TableList = styled.div`
  margin: 20px 0 20px 0;
`;

export const SearchInput = styled.div<{ disabled?: boolean }>`
  min-height: 48px;
  max-width: 250px;
  margin: 0;
  font-size: 12px;
  color: #000;
  width: 100%;
  border: 1px solid #818181;
  border-radius: 5px;
  box-sizing: border-box !important;
  display: inline-flex;

  span {
    ${({ disabled = false }) => disabled && css`color: #ABB0B4`}
  }
`;

export const Label = styled.span`
  transition: all 0.2s;
  margin-top: -6px;
  margin-left: 16px;
  margin-right: 16px;
  color: ${colors.Blue700};
  font-size: 11px;
  font-weight: bold;
`;

export const Link = styled.div<{ disabled?: boolean }>`
  font-size: 11px;
  line-height: 13px;
  color: #363BC4;
  text-decoration: underline;

  margin-top: 6px;

  cursor: pointer;

  ${({ disabled = false }) => disabled && css`
    cursor: none;
    color: #ABB0B4;
  `}
`;

export const InvisibleDutsMosaic = styled.div`
  background: #FFFFFF;
  border: 1px solid rgba(54, 59, 196, 0.2);
  border-radius: 4px;
  width: 200px;
  height: 186px;
  display: flex;
  flex-direction: column;
  text-align: center;
  padding: 20px;
  justify-content: center;
  p {
    margin-bottom: 2px;
  }
  h6 {
    font-weight: 400;
    font-size: 14px;
    color: blue;
  }
`;
