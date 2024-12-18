import styled from 'styled-components';

import { colors } from '../../styles/colors';

export const LayerBackgroundModal = ({ children }): JSX.Element => <Layer>{children}</Layer>;

const Layer = styled.div`
  width: 100vw;
  height: 100vh;
  z-index: 3;
  position: fixed;
  overflow-y: auto;
  overflow-x: hidden;
  top: 0;
  left: 0;
  background-color: ${`${colors.Grey400}99`};
  display: flex;
  justify-content: center;
  align-items: center;
`;
