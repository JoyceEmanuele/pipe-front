import styled from 'styled-components';
import { colors } from '~/styles/colors';
import { Link } from 'react-router-dom';

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

export const Label = styled.span`
  transition: all 0.2s;
  margin-top: -6px;
  margin-left: 16px;
  margin-right: 16px;
  color: ${colors.Blue700};
  font-size: 11px;
  font-weight: bold;
`;

export const SearchInput = styled.div`
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
`;

export const BtnClean = styled.div`
  cursor: pointer;
  color: ${colors.BlueSecondary};
  margin-top: 7px;
  text-decoration: underline;
  font-size: 11px;
`;

export const StyledSpan = styled.span`
  font-size: 1em;
  font-weight: bold;
  color: ${colors.Grey400};
`;

export const MosaicContainer = styled.div`
  display: flex;
  border: 1px solid #D7D7D7;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  border-top: none;
  padding: 30px 40px 30px 40px;
  min-height: 300px;
  max-height: 515px;
  flex-wrap: wrap;
  overflow-y: auto;
`;

export const TransparentLink = styled(Link)`
  color: inherit;
  text-decoration: inherit;
  &:hover {
    color: inherit;
    text-decoration: inherit;
  }
`;

export const TableItemCell = styled.div`
  font-size: 12.6px;
  margin: 5px 0px;
`;
