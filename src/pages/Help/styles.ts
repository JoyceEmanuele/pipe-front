import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const ExpansionBody = styled.div`
  border-radius: 16px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
  .MuiExpansionPanelSummary-content {
    margin: 0;
  }
  p {
    color: ${colors.Grey300};
    font-weight: bold;
    font-size: 1em;
    line-height: 22px;
    margin: 0;
  }
  .MuiExpansionPanelDetails-root p,
  .MuiExpansionPanelDetails-root ul {
    color: ${colors.Grey400};
    font-weight: normal;
  }
  .MuiExpansionPanelSummary-expandIcon {
    transform: rotate(-180deg);
  }
  .MuiExpansionPanelSummary-expandIcon.Mui-expanded {
    transform: rotate(0deg);
  }
`;

export const SectionTitle = styled.h1`
  font-size: 1.25em;
  color: ${colors.Grey300};
  margin-bottom: 20px;
  margin-top: 24px;
`;
