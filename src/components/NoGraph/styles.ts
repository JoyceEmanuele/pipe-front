import { Flex } from 'reflexbox';
import styled from 'styled-components';
import { colors } from '../../styles/colors';

export const Container = styled(Flex)`
  width: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: 1px solid ${colors.LightGrey_v3};
  border-radius: 10px;
  padding: 50px 0;
  background: #F9F9F9;
  min-height: 400px;
  color: #7D7D7D;
`;
