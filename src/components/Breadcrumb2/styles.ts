import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { colors } from '../../styles/colors';

const base = `
  font-size: 12px;
  font: Inter;
  line-height: 13.31px;
  color: #858585;
  font-weight: 400;
  cursor: pointer;
  svg {
    margin-right: 4px;
  }
  &:hover {
    color: #000000;
    .icon_seta path {
      fill: #000;
    }
  }
`;

export const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  ${base}
  cursor: pointer;
`;

export const StyledLinkLast = styled(StyledLink)`
  color: #000;
  font-size: 12px;
  font-weight: bold;
  text-decoration-line: none;
`;

export const Separator = styled.span`
  ${base}
  text-decoration: none;
  color: #858585;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const TimezoneInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  svg {
    margin: 0;
  }
`;
