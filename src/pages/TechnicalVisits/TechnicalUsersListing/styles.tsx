import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const CardHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 10px;
`;

export const CardSubHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 10px;

  b {
    color: ${colors.Blue500};
    font-size: 14px;
  }

  span {
    color: ${colors.Blue700};
  }
`;

export const Content = styled.div`
  margin-top: 40px;
`;
