import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const Container = styled.div``;

type HeaderProps = {
  isDurationVisible: boolean;
}

export const Header = styled.div<HeaderProps>`
  margin: 10px;
  display: grid;
   grid-template-columns: ${({ isDurationVisible }) => (isDurationVisible ? '1fr 2fr 1fr 2.5fr 2fr 1.5fr 0.9fr 4.2fr' : '1fr 2fr 1fr 2.5fr 2fr 2fr 5fr')};
`;

export const ListContainer = styled.div`
  height: 600px;
  overflow-y: scroll;
  padding-top: 25px;
  margin-top: 5px;
  border-top: 1px solid rgba(0, 0, 0, 0.2);
  padding-bottom: 10px;

  ::-webkit-scrollbar {
    width: 15px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: #686868;
  }
`;

export const ListItemContainer = styled.div`
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border: 1px solid #D7D7D7;
  color: ${colors.BlueSecondary};
  min-height: 80px;
  border-radius: 8px;
  border-top: 10px solid ${colors.BlueSecondary};
  margin-right: 15px;
  margin-bottom: 16px;
`;

type ListItemContentProps = {
  isDurationVisible: boolean;
}

export const ListItemContent = styled.div<ListItemContentProps>`
  display: grid;
  margin-top: 10px;
  margin-left: 15px;
  width: 100%;
  grid-template-columns: ${({ isDurationVisible }) => (isDurationVisible ? '1fr 2fr 1fr 2.5fr 2fr 1.5fr 0.8fr 4fr' : '1fr 2fr 1fr 2.5fr 2fr 2fr 5fr')};
  align-items: center;

  span {
    color: ${colors.BlueSecondary};
    font-size: 12px;
  }
`;

export const ListItemBtnsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 15px;
  margin-top: -10px;
  flex-wrap: wrap;
  padding-top: 10px;
  padding-bottom: 10px;
`;

export const ListTitleContainer = styled.div`
  display: flex;
  align-items: center;

  span {
    font-weight: bold;
    color: #555555;
    font-size: 12px;
    margin-right: 5px;
  }
`;

export const CaretsContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

export const Caret = styled.button`
  background-color: #fff;
  border: none;
  cursor: pointer;
  width: 12px;
  height: 10px;
  padding: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
