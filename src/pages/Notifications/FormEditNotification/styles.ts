import ReactTooltip from 'react-tooltip';
import styled from 'styled-components';
import { colors } from '~/styles/colors';

export const OffsetContainer = styled.span`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px;
  height: 25px;
  margin-top: 10px;
  min-width: 40%;
  border-radius: 5px;
`;

export const Offset = styled.span`
  font-weight: bold;
  font-size: 0.75em;
  margin-left: 5px;
  color: ${colors.Blue300};
`;

export const IconWrapper = styled.div<{ disabled }>(({ disabled }) => `
  display: flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 16px;
  ${disabled ? 'cursor: not-allowed;' : 'cursor: pointer;'}
`);

export const StyledReactTooltip = styled(ReactTooltip)`
  max-width: 500px;
`;
