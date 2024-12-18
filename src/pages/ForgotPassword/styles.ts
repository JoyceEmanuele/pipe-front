import styled from 'styled-components';

import { Button, Link } from '~/components';
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
  width: 400px;
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

    .spanText {
      margin-bottom: 20px;

      span {
        font-size: 1.0rem;
        color: ${colors.White};
      }
    }

`;

type StyledButtonProps = {
  send?: boolean;
};

export const StyledButton = styled(Button)<StyledButtonProps>(
  ({ send }) => `
  margin-top: ${send ? '122px' : '49px'};

  :hover {
    background-color: ${colors.Blue300};
    border-color: ${colors.Blue300};
  }
`,
);

export const StyledLink = styled(Link)`
  margin-top: 50px;
  color: ${colors.GrenTab};
  font-size: 0.8rem;
  text-decoration: underline;
`;
