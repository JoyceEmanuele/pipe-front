import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const DesktopTable = styled.div`
  display: none;
  @media (min-width: 768px) {
    display: block;
  }
`;

export const StyledSpan = styled.span`
  color: ${colors.Grey400};
  font-size: 1em;
`;

export const StyledLink = styled(Link)`
  color: ${colors.Grey400};
  font-size: 1em;
`;

export const SearchInput = styled.div`
  min-height: 48px;
  margin: 0;
  font-size: 12px;
  margin-left: 16px;
  color: #000;
  width: 100%;
  border: 1px solid #E9E9E9;
  border-radius: 5px;
  box-sizing: border-box !important;
  display: inline-flex;
`;

export const IconWrapper = styled.div`
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-top: 15px;
  margin-right: 15px;
  svg {
    width: 18px;
    height: 18px;
  }
`;

export const Label = styled.label`
  position: relative;
  display: inline-block;
  width: 100%;
  margin-top: 6px;
  margin-left: 16px;
  margin-right: 16px;
  color: #202370;
  font-size: 11px;
  font-weight: bold;
`;
