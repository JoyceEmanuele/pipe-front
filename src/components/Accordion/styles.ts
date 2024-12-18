import styled from 'styled-components';

import { ArrowIcon } from '../../icons';
import { colors } from '../../styles/colors';

export const Wrapper = styled.div`
  width: 100%;
`;

export const HeaderWrapper = styled.div`
  display: flex;
`;

type StyledArrowIconProps = {
  isOpen: boolean;
}

export const StyledArrowIcon = styled(ArrowIcon)<StyledArrowIconProps>(
  ({ isOpen }) => `
  margin-left: 12px;
  transition: all 0.2s;
  transform: rotate(${isOpen ? '0' : '-180'}deg);
`,
);

export const Header = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 24px;
`;

export const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

export const StyledTitle = styled.span`
  font-weight: bold;
  font-size: 1.25em;
  line-height: 27px;
  color: ${colors.Black};
`;

export const StyledTitle3 = styled.span`
  font-weight: bold;
  color: ${(props) => props.color};
`;

export const CollapsedContent = styled.div<{ isOpen: boolean }>(
  ({ isOpen }) => `
  width: 100%;
  ${isOpen ? '' : 'height: 0; overflow: hidden;'}
`,
);
