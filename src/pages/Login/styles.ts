import styled from 'styled-components';

import { Button, Link } from '~/components';
import { colors } from '~/styles/colors';

export const ContainerCard = styled.div`
  position: relative;
  align-items: center;
  display: flex;
  justify-content: center;
  flex-direction: column;
  min-height: 100vh;
  background: ${colors.BlueMenu};
  overflow: hidden;
  padding: 92px 0 92px 0;
  min-width: 321px;
`;

export const LoginCard = styled.div`
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 400px;
  min-width: 304px;
  min-height: 386px;
  padding: 24px;
  background-color: ${colors.BlueMenu};
  margin: 31px 0 0 0;
  z-index: 3;
  input:first-of-type {
    margin-bottom: 24px;
  }

  .titleLogin {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0px 0px 60px 0px;

    span {
      margin-top: 10px;
      font-weight: bold;
      font-size: 1.4rem;
      color: ${colors.White};
    }

    img {
      width: 150px;
      height: 50px;
    }
  }
`;

export const StyledButton = styled(Button)`
  margin-top: 58px;
  border-radius: 10px;
  background-color: ${colors.Blue300};
  border-color: ${colors.Blue300};

  :hover {
    background-color: ${colors.Blue300};
    border-color: ${colors.Blue300};
  }
`;

export const StyledLink = styled(Link)`
  color: ${colors.GrenTab};
  font-size: 0.8rem;
  text-decoration: underline;
`;
