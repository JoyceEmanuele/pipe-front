import styled from 'styled-components';
import { healthLevelColor } from '~/components/HealthIcon';

export const DataContainer = styled.div<{ expanded: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  line-height: normal;
  width: 174px;
  height: 100%;

  margin-top: ${({ expanded }) => !expanded && '5px'};
`;

export const Title = styled.h3`
  font-size: 13px;
  line-height: 13px;
  font-weight: 700;
  color: #000000;
  margin: 0;
  width: max-content;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 184px;
`;

export const Label = styled.p`
  font-size: 11px;
  font-weight: 500;
  color: #6D6D6D;
  width: max-content;
`;

export const HealthContainer = styled.div<{ expanded: boolean }>`
  display: flex;
  justify-content: space-around;
  margin: auto 0;
  border-right: 1px solid #E2E2E2;
  padding: 10px 0;
  height: 60px;

  > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;

    > strong {
      font-size: 12px;
    }

    > span {
      font-size: 14px;
      font-weight: bold;
      color: #110202;
    }
  }
`;

export const StatusContainer = styled.div`
  display: flex;
  margin-top: auto;
  width: 100%;
  gap: 12px;
  justify-content: flex-start;
  align-items: end;
`;

export const Icon = styled.div<{ health: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 27px;
  height: 27px;
  border-radius: 5px;
  background-color: ${({ health }) => healthLevelColor(health)};

  > svg {
    width: 14px;
    height: 14px;
  }
`;

export const IconWiFiRealTime = styled.div`
  display: flex;
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const WaterTemperatureTooltipContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
  gap: 8px;
  padding: 0;
`;

export const WaterTemperatureTooltipLabel = styled.h4`
  font-weight: 700;
  font-size: 10px;
  line-height: 8px;
  margin: 0;
  margin-bottom: 4px;
`;

export const SetpointTitle = styled.span`
  font-weight: 700;
  font-size: 12px;
  line-height: 9px;
`;

export const SetpointMeasure = styled.span`
  font-weight: 400;
  font-size: 12px;
  line-height: 9px;
`;
