import styled from 'styled-components';

import { colors } from '../../styles/colors';

export const Text = styled.span`
  font-weight: normal;
  font-size: 1em;
  color: ${colors.Grey400};
  display: flex;
  align-items: center;
  gap: 5px;
  strong {
    font-weight: bold;
    color: ${colors.Grey400};
  }
`;

export const AccordionTitle = styled.h3`
  font-weight: bold;
  font-size: 10px;
  color: #363BC4;
  margin-bottom: 0;
`;

export const AccordionInfo = styled.span`
  display: flex;
  font-weight: 400;
  font-size: 10px;
  text-decoration: underline;
`;

export const ContainerViewNotification = styled.span`
  padding-top: 10px;
  align-self: flex-start;
  text-decoration: none;
`;
