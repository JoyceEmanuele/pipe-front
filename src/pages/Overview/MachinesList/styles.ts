import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Select } from '~/components';
import { colors } from '~/styles/colors';

export const WrapperTable = styled.div<{ viewMore }>(
  ({ viewMore }) => `
  height: auto;
  min-height: 240px;
  max-height: ${viewMore ? '100%' : '240px'};
  overflow-y: hidden;
  overflow-x: visible;
`,
);

export const StyledTable = styled.table`
  width: 100%;
  height: 100%;
  max-height: 500px;
  tbody:before {
    content: '@';
    display: block;
    text-indent: -99999px;
  }
`;

export const HeadItem = styled.th`
  width: 100%;
`;

export const HeadData = styled.th`
  padding: 0 0 0 4px;
  @media (min-width: 480px) {
    padding: 0 8px 0 8px;
  }
  @media (min-width: 1200px) {
    padding: 0 16px 0 16px;
  }
`;

export const BodyItem = styled.td<{ align?, padding? }>(
  ({ align, padding }) => `
  font-size: 1em;
  text-align: ${align || 'center'};
  padding: ${padding || '12px 0 0 0'};
  color: ${colors.Grey400};
  white-space: nowrap;
`,
);

export const StyledLink = styled(Link)`
  color: ${colors.Grey400};
  text-decoration: none;
`;

export const StyledDiv = styled.div`
  max-width: 280px;
  padding: 0 24px 0 8px;
  white-space: nowrap;
  text-align: left;
`;

export const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const HealthIconBox = styled.div(
  ({ color = colors.Red }) => `
  display: flex;
  justify-content: space-around;
  align-items: center;
  min-width: 30px;
  min-height: 32px;
  background-color: ${color};
  padding 3px;
  border-radius: 6px;
`,
);

export const StyledSpan = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1em;
  font-weight: bold;
  color: ${colors.Grey300};
  white-space: nowrap;
`;

export const StyledToggle = styled.span`
  display: none;
  @media (min-width: 768px) {
    display: block;
  }
`;

export const ViewMoreArrow = styled.p<{ viewMore }>(
  ({ viewMore }) => `
  span {
    font-size: 1em;
    color: ${colors.Grey400};
  }
  &:hover {
    cursor: pointer;
  }
  svg {
    margin-left: 12px;
    transition: all 0.2s;
    transform: rotate(${viewMore ? '-180' : '0'}deg);
  }
`,
);

export const MobileSelect = styled(Select)`
  display: block;
  @media (min-width: 768px) {
    display: none;
  }
`;

export const DesktopSelect = styled(Select)`
  display: none;
  @media (min-width: 768px) {
    display: block;
  }
`;
