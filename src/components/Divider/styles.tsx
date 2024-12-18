import styled, { css } from 'styled-components';
import { colors } from '../../styles/colors';

export const StyledDivider = styled.div<{width: number, height: number, color: string}>`
  ${({ width = 100, height = 2, color = colors.GreyDefaultCardBorder }) => css`
    background-color: ${color};
    width: ${width}%;
    height: ${height}px;
  `}
`;
