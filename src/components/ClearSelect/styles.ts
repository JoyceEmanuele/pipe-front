import styled from 'styled-components';

import { colors } from '../../styles/colors';

export const IconWrapper = styled.div<{ disabled }>(({ disabled }) => `
  display: flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 16px;
  ${disabled ? 'cursor: not-allowed;' : 'cursor: pointer;'}
`);

export const SelectedContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px;
  height: 25px;
  margin-top: 10px;
  min-width: 40%;
  max-width: 70%;
  border-radius: 5px;
`;

export const Selected = styled.span`
  font-weight: bold;
  font-size: 0.75em;
  margin-left: 5px;
  color: ${colors.Blue300};
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;
