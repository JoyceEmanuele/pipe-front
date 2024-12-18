import styled from 'styled-components';

interface StepProps {
  active?: boolean;
  hightlight?: boolean;
  completed?: boolean;
}

export const TourColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;

  span {
    color: #4B4B4B;
    font-size: 11px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-transform: uppercase;
  }

  h3 {
    color: #000;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }

  p {
    margin-top: 5px;
    color: #000;
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: 140%;
  }

  footer {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;

      span {
        color: #363BC4;
        cursor: pointer;
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        text-transform: capitalize;
        text-decoration-line: underline;
      }

      button {
        width: 100px;
        color: #FFF;
        font-size: 14px;
        font-style: normal;
        font-weight: 700;
        line-height: normal;
      }
  }
`;

export const Stepper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
`;

export const Step = styled.div<StepProps>`
  position: relative;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin: 0 20px;
  cursor: pointer;

  ${(props) => {
    const getBackgroundColor = () => {
      if (props.active) return '#363BC4';
      if (props.completed) return '#5AB365';
      return 'white';
    };

    const getBorderColor = () => {
      if (props.completed) return '#5AB365';
      return 'rgba(151, 151, 151, 0.59)';
    };

    return `
      background-color: ${getBackgroundColor()};
      border: 1px solid ${getBorderColor()};
    `;
  }}

  &:after {
    color: #fff;
    content: '${(props) => (props.completed ? '✓' : '●')}';
    font-size: 8px;
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 100%;
    transform: translateY(-50%);
    width: 34px;
    height: 1px;
    background-color: rgba(151, 151, 151, 0.59);
    margin-left: 4px;
  }
`;

export const HighlightChildren = styled.div<StepProps>`
  position: relative;
  z-index: ${(props) => (props.hightlight ? 999 : 1)};
  padding: 4px 10px;
  border-radius: 8px;
  background: ${(props) => (props.hightlight ? 'white' : 'transparent')};
  pointer-events: none;
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
`;
