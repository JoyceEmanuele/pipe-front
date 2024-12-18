import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { colors } from '../../styles/colors';

const StyledLink = styled(Link)`
  color: ${colors.LightBlue};
  font-size: 0.8em;
`;

export { StyledLink as Link };
