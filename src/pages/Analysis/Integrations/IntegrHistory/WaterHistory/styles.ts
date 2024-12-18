import { Box } from 'reflexbox';
import styled from 'styled-components';

export const HoverConsumptionInfo = styled.div`
  display: flex;
  width: 200px;
  gap: 8px;
  /* border-radius: 5px; */
  color: white;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-size: 11px;
  line-height: 13px;
`;

export const HoverMeterInfo = styled.div`
  display: flex;
  position: 'relative';
  flex-direction: column;
  width: 175;
  gap: 8px;
  /* border-radius: 5px; */
  color: black;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-size: 11px;
  line-height: 13px;
  background-color: "#fff";
`;

export const ContainerCaption = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  margin-top: 3px;
  gap: 30px;
`;

export const ContainerArrowLeft = styled.div`
  display: flex;
  width: 35px;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #EDEDED;
  cursor: pointer;
`;
export const ContainerArrowRight = styled.div<{disabled: boolean }>(
  ({
    disabled,
  }) => `
  display: flex;
  width: 35px;
  align-items: center;
  justify-content: center;
  border-left: 1px solid #EDEDED;
  cursor: pointer;
  pointer-events: ${disabled ? 'none' : 'all'}
`,
);

export const LabelData = styled.div`
  position: relative;
  top: 3px;
  margin-left: 13px;
  font-size: 11px;
  font-weight: 700;
  line-height: 15px;
`;

export const ContainerUsageDiff = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  color: #92CC9A;
  font-size: 12px;
  font-weight: 700;
  line-height: 15px;
`;

export const ButtonReturnPeriod = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 74px;
  height: 22px;
  border-radius: 5px;
  border: 1px solid #363BC4;
  color: #363BC4;
  font-size: 10px;
  font-weight: 700;
  line-height: 11px;
  margin-right: 20px;
  cursor: pointer;
`;

export const ContainerIcon = styled(Box)<{ period_usage_up: boolean }>(
  ({ period_usage_up }) => `
  display:flex;
  align-items: center;
  justify-content: center;
  transform: rotate(${period_usage_up ? '180' : '360'}deg);
  transition: all 0.2s;
`,
);
