import styled from 'styled-components';

import { Button } from '~/components';
import { colors } from '~/styles/colors';

export const ContainerCard = styled.div`
  position: relative;
  align-items: center;
  display: flex;
  justify-content: center;
  flex-direction: column;
  height: 100vh;
  background: ${colors.BlueMenu};
  overflow: hidden;
  padding: 92px 0 92px 0;
`;

export const ForgotPasswordCard = styled.div`
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 400px;
  width: 100%;
  min-height: 386px;
  padding: 24px 16px;
  background: ${colors.BlueMenu};
  margin: 31px 0 0 0;
  z-index: 3;

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
    };

  }
`;
export const BackgroundImage = styled.img`
  position: absolute;
  z-index: 1;
  width: 100%;
  top: 16px;
  @media screen and (min-width: 768px) {
    top: 150px;
  }
`;
export const LogoImage = styled.img`
  width: 144px;
  display: none;
  z-index: 2;
  @media screen and (min-width: 768px) {
    display: block;
    position: absolute;
    top: 40px;
    left: 40px;
  }
`;
export const LogoImageMobile = styled.img`
  width: 144px;
  z-index: 2;
  @media screen and (min-width: 768px) {
    display: none;
  }
`;
export const Title = styled.h1`
  margin: 0 0 27px 0;
  text-align: center;
  font-size: 1.5em;
  color: ${colors.Pink200};
`;

export const StyledButton = styled(Button)`
  margin-top: 20px;
  
`;
