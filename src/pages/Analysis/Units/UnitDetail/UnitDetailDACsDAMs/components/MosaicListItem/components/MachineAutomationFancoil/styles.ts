import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 170px;
  height: 100%;
`;

export const Title = styled.h3`
  font-size: 13px;
  line-height: 13px;
  font-weight: 700;
  color: #000000;
  margin: 0;
  width: max-content;
`;

export const Label = styled.p`
  font-size: 11px;
  font-weight: 500;
  color: #6D6D6D;
  width: max-content;
`;

export const ModeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: auto 0;
  border-right: 1px solid #E2E2E2;
  padding: 10px 0;
`;

export const StatusContainer = styled.div`
  display: flex;
  margin-top: auto;
  width: 100%;
  gap: 12px;
  justify-content: flex-start;
  align-items: center;
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

export const IconWatchButton = styled.button`
  border: 0;
  padding: 0;
  background: none;
  display: flex;
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const LabelSwitch = styled.span`
  font-size: 7px;
  line-height: 8px;
  font-weight: 500;
  color: #6D6D6D;
`;

export const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
`;

export const DriContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Status = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SetPointRow = styled.div`
  display: flex;
  align-items: start;
  justify-content: start;
  gap: 12px;
  width: 100%;
  margin: auto 0;
  padding: 10px 0;
  border-right: 1px solid #E2E2E2;
`;

export const SetPointContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #E2E2E2;
  height: 40px;
  overflow: hidden;
`;

export const SetPointLabel = styled.span`
  font-weight: 700;
  font-size: 13px;
  line-height: 16px;
`;

export const Arrows = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  border-left: 1px solid #E2E2E2;
  width: 28px;
`;

export const ArrowUp = styled.button`
  height: 20px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  cursor: pointer;
  background: #FFFFFF;
  border-top-right-radius: 8px;
`;

export const ArrowDown = styled.button`
  height: 20px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-top: 1px solid #E2E2E2;
  cursor: pointer;
  background: #FFFFFF;
  border-bottom-right-radius: 8px;
`;

export const TempSetPoint = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  padding: 0 8px;
`;
