import styled from 'styled-components';
import { colors } from '~/styles/colors';

export const GreenBlob = styled.div`
  background: #4EB73B;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(142, 210, 130, 1);
  margin-right: 5px;
  height: 11px;
  width: 11px;
  transform: scale(1);
  animation: greenPulse 2s infinite;

  @keyframes greenPulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(142, 210, 130, 0.7);
    }
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 8px rgba(0, 0, 0, 0);
    }
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
    }
  }
`;

export const YellowBlob = styled.div`
  background: #EDA800;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(255, 206, 0, 1);
  margin-right: 5px;
  height: 11px;
  width: 11px;
  transform: scale(1);
  animation: yellowPulse 2s infinite;

  @keyframes yellowPulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(255, 206, 0, 0.7);
    }
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 8px rgba(0, 0, 0, 0);
    }
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
    }
  }
`;

export const RedBlob = styled.div`
  background: #FF1818;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(255, 103, 103, 1);
  margin-right: 5px;
  height: 11px;
  width: 11px;
  transform: scale(1);
  animation: redPulse 2s infinite;

  @keyframes redPulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(255, 103, 103, 0.7);
    }
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 8px rgba(0, 0, 0, 0);
    }
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
    }
  }
`;

export const GreyBlob = styled.div`
  background: #E9E9E9;
  border-radius: 50%;
  margin: 10px;
  height: 11px;
  width: 11px;
`;

export const BlackBlob = styled.div`
  background: #545454;
  border-radius: 50%;
  margin: 10px;
  height: 11px;
  width: 11px;
`;

export const ProgressBarContainer = styled.div`
  background-color: #D9D9D9;
  height: 5px;
  width: 100%;
  border-radius: 16px;
  position: relative;
  transition: all 0.5s;
  will-change: transform;
`;

export const ProgressBarChildren = styled.div<{progress: number}>(
  ({ progress }) => `
    border-radius:16px;
    width: ${progress}%;
    position: absolute;
    height: 100%;
    content: none;
    background-color: #363BC4;
    top:0;
    bottom: 0;
    border-radius: inherit;
    display: flex;
    justify-content: center;
    align-items:center;
    color: white;
`,
);

export const IconBiggerWrapper = styled.div`
  display: inline-block;
  width: 21px;
  height: 21px;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  /* margin-left: 6px; */
  svg {
    width: 21px;
    height: 21px;
  }
`;

export const TopTitle = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  line-height: 16px;
  color: ${colors.Black};
`;

export const CellLabel = styled.span`
  color: ${colors.Black};
  font-weight: normal;
  font-size: 12px !important;
`;

export const TitleColumn = styled.div`
justify-content: flex-start;
display: flex;
flex-direction: row;
`;

export const OrderColumn = styled.div`
padding-left: 5px;
padding-right: 5px;
padding-bottom: 4px
border-radius: 11px;
border: 1px solid lightgrey;
cursor: pointer;
border`;

export const BtnOrderColumns = styled.div<{ disabled?: boolean }>(
  ({ disabled }) => `
  cursor: pointer;
  padding: 0 10px;
  border: 1px solid lightgrey;
  font-weight: 500;
  border-radius: 10px;
  box-shadow: 0 2px 4px 1px rgba(0, 0, 0, 0.1);
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  height: 40px;
  gap: 10px;

  &:hover {
    color: ${colors.BlueSecondary};
  }

  ${disabled && `
    opacity: 0.5;
    cursor: not-allowed;
  `}
`,
);

export const NoDataComponent = styled.div<{minHeight?: string}>(
  ({ minHeight }) => `
  background-color: #F9F9F9;
  color: #7D7D7D;
  text-align: center;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: ${minHeight || '200px'};
  border: 1px solid #E8E8E8;
  margin: 0 10px 20px 10px;
`,
);
