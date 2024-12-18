import styled from 'styled-components';
import { Input } from '~/components';
import { colors } from '~/styles/colors';

export const MainContent = styled.div`
  background: ${colors.White};

  height: fit-content;

  display: flex;
  flex-direction: column;
  gap: 15px;

  width: 100%;

  h1 {
    margin: 0;

    color: ${colors.Black};

    font-family: Inter;
    font-size: 24px;
    font-style: normal;
    font-weight: 400;
    line-height: 39px;
  }

  .outlineButton {
    color: ${colors.BlueSecondary};

    font-family: Inter;
    font-size: 10px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    text-decoration-line: underline;

    cursor: pointer;
  }
`;

export const LoginInput = styled(Input)`
  border-radius: 10px;
  border: 1px solid rgba(54, 60, 195, 0.21);

  background: ${colors.White};
`;
