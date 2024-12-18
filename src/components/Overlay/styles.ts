import styled from 'styled-components';

import { colors } from '../../styles/colors';

export const Layer = styled.div`
  width: 100%;
  height: 100%;
  z-index: 2;
  position: absolute;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: ${`${colors.Grey030}99`};
  display: flex;
  justify-content: center;
  align-items: center;
`;
