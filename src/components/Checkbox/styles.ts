import styled from 'styled-components';

import { colors } from '../../styles/colors';

export const Base = styled.div<{ checked?: boolean, size?: number }>`
  align-items: center;
  background-color: ${({ checked }) => (checked ? colors.BlueSecondary : colors.White)};
  border: 1px solid ${({ checked }) => (checked ? colors.BlueSecondary : colors.Grey)};
  border-radius: 5px;
  display: flex;
  justify-content: center;
  width: ${({ size }) => (!size ? '25px;' : `${size}px`)};
  height: ${({ size }) => (!size ? '25px;' : `${size}px`)};
  min-width: ${({ size }) => (!size ? '25px;' : `${size}px`)};
  min-height: ${({ size }) => (!size ? '25px;' : `${size}px`)};
`;

export const Label = styled.label`
  cursor: pointer;
  display: flex;
  color: ${colors.Grey400};
`;
