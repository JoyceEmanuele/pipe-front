import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const Desktop = styled.div`
  display: none;
  @media (min-width: 768px) {
    display: block;
  }
`;

export const Mobile = styled.div`
  display: block;
  @media (min-width: 768px) {
    display: none;
  }
`;

export const DataCard = styled.div`
  &:not(:first-child) {
    margin-top: 16px;
  }
`;

export const DataItem = styled.div`
  display: block;
  font-size: 1em;
  color: ${colors.Grey400};
  font-weight: bold;
  &:not(:first-child) {
    margin-top: 16px;
  }
`;

export const StyledSpan = styled.span`
  color: ${colors.Grey400};
  text-align: center;
`;

export const CancelButton = styled.a`
  display: flex;
  justify-content: center;
  font-family: 'Inter';
  font-size: 11px;
  line-height: 16px;
  color: #6C6B6B;
  margin-inline: auto;
  text-decoration-line: underline;
`;
