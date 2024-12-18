import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const Container = styled.div``;

export const Header = styled.div`
  margin: 10px;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 2.5fr 2fr 2fr 5fr;

  span {
    font-weight: bold;
    color: #555555;
    font-size: 12px;
  }
`;

export const ListContainer = styled.div`
  height: 600px;
  overflow-y: scroll;
  padding-top: 25px;
  margin-top: 5px;
  border-top: 1px solid rgba(0, 0, 0, 0.2);

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

export const ListItemContent = styled.div`
  display: grid;
  margin-top: 10px;
  margin-left: 15px;
  width: 100%;
  grid-template-columns: 1fr 2fr 1fr 2.5fr 2fr 2fr 5fr;

  span {
    color: ${colors.BlueSecondary};
    font-size: 12px;
  }
`;
