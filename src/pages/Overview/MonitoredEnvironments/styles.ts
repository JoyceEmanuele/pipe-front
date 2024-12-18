import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  background-color: ${colors.Grey300};
  width: 115px;
  height: 32px;
  border-radius: 8px;
  span {
    font-weight: bold;
    font-size: 1.2em;
    text-align: center;
    color: ${colors.White};
    margin-left: 5px;
  }
`;

export const TotalEnvironments = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  @media (min-width: 992px) {
    margin-right: 50px;
  }
  h1 {
    font-weight: 800;
    font-size: 5em;
    text-align: center;
    min-width: 110px;
    margin: 0;
    margin-bottom: 10px;
    color: ${colors.Grey400};
  }
`;

export const EnvironmentStatus = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const EnvironmentLastResults = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 310px;
  ${EnvironmentStatus} {
    &:not(:last-of-type) {
      margin-bottom: 16px;
    }
  }
`;

export const TemperatureType = styled.span`
  font-weight: bold;
  font-size: 1em;
  color: ${colors.Grey300};
`;

export const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const DUTName = styled.span`
  font-size: 1em;
  text-decoration-line: underline;
  color: ${colors.Grey400};
`;

export const MonitoredEnvironments = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  min-height: 170px;
  @media (max-width: 992px) {
    flex-direction: column;
  }
`;
