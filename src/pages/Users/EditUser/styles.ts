import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const Form = styled.form`
  border-radius: 8px;
  padding: 12px 24px 32px;
  border: 1px solid ${colors.GreyDefaultCardBorder};
  border-top: 10px solid ${colors.BlueSecondary};
`;

export const PictureBox = styled.div`
  display: flex;
  width: 280px;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border-radius: 4px;
`;
