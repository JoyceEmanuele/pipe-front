import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const Header = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Title = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: #000;
`;

export const Link = styled(NavLink)`
  color: ${colors.Grey500};
  text-decoration: none;
`;
