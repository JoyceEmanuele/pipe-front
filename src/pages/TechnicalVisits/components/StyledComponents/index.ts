import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const DefaultCard = styled.div`
  border-radius: 8px;
  padding: 40px;
  border: 1px solid ${colors.GreyDefaultCardBorder};
  border-top: 10px solid ${colors.BlueSecondary};
  width: 60%;

  @media (max-width: 768px) {
    width: 100%;
    margin: 0 auto;
    padding: 15px;
  }

  @media (max-width: 1280px) {
    width: 90%;
    margin: 0 auto;
  }

  @media (max-width: 1800px) {
    width: 80%;
  }
`;

export const TabsContainer = styled.div`
  margin: 25px 0px 35px;
  border-bottom: 1px solid ${colors.Grey100};
  max-width: 100%;

  @media (max-width: 768px) {
    overflow-x: scroll;
  }
`;

export const TabsList = styled.ul`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0px;
  margin: 0px;
  list-style: none;

  li:not(:first-child) {
    margin-left: 10px;
  }

  .active {
    color: ${colors.Blue300};
    border-radius: 3px 3px 0px 0px;
  }
`;

export const TabItem = styled.li<{ isActive: boolean }>`
  white-space: nowrap;
  padding: 0px 20px;
  color: ${(props) => (props.isActive ? colors.Blue300 : colors.Grey500)};
  font-size: 13px;
  font-weight: bold;
  border-radius: 3px 3px 0px 0px;
  div {
    border-bottom: ${(props) => (props.isActive && `7px solid ${colors.Blue300}`)};
    border-radius: 3px 3px 0px 0px;
    height: 7px;
    width: 100%;
    margin-top: 5px;
  }
`;
