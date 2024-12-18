import styled from 'styled-components';

import { colors } from '../../styles/colors';
import { Link } from 'react-router-dom';

export const Text = styled.span`
  font-weight: normal;
  font-size: 1em;
  color: ${colors.Grey400};

  strong {
    font-weight: bold;
    color: ${colors.Grey400};
  }
`;

export const TransparentLink = styled(Link)`
  color: inherit;
  text-decoration: inherit;
  :hover {
    color: ${colors.Black};
    text-decoration: none;
    cursor: pointer;
  }
`;

export const ViewAllContainer = styled.span`
  width: 200px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #D7D7D7;
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: flex-end;
  gap : 8px;
  position: absolute;
  top: -60px;
  right: 0px;
  span {
    font-weight: 700;
    font-size: 12px;
    color: #363BC4;
  }
  box-shadow: 0px 4px 4px 0px #0000001A;

`;
