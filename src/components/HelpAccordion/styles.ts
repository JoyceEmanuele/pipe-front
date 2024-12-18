import styled from 'styled-components';

import { ArrowIcon } from '~/icons';
import { colors } from '~/styles/colors';

export const SubItems = styled.div<{ display }>(
  ({ display }) => `
  display: ${display};
  color: ${colors.Grey400};
`,
);
export const Header = styled.div`
  cursor: pointer;
  background: ${colors.White};
  min-height: 56px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

type IconProps = {
  rotation: boolean;
}

export const Icon = styled(ArrowIcon)<IconProps>(
  ({ rotation }) => `
  transition: all 0.3s;
  ${rotation ? 'transform: rotate(180deg);' : ''}
`,
);

export const IconWrapper = styled.div`
  min-width: 24px;
  height: auto;
  display: flex;
  justify-content: center;
`;
export const Item = styled.span`
  font-weight: bold;
  font-size: 1em;
  line-height: 22px;
  color: ${colors.Grey300};
  margin-right: auto;
`;
export const Title = styled.h2`
  color: ${colors.Grey300};
  margin: 0;
`;
export const AccordionBox = styled.div`
  width: 100%;
  height: auto;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
  border-radius: 16px;
`;
export const Wrapper = styled.div`
  max-width: 100%;
  border-radius: 4px;
  padding: 0px 16px;
`;
export const Separator = styled.div`
  width: 100%;
  height: 1px;
  box-shadow: inset 0px -1px 0px rgba(162, 172, 189, 0.3);
`;
