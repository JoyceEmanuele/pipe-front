import styled from 'styled-components';
import { LineIcon, TimeIcon, CalendarIcon } from '~/icons';
import { colors } from '~/styles/colors';

export const VarsCardTitle = styled.div`
  font-weight: bold;
  padding-bottom: 15px;
`;
export const VarName = styled.div`
  font-weight: bold;
  color: #5b5b5b;
`;
export const VarValue = styled.span<{relevance?: number | string }>`
  font-weight: bold;
  font-size: ${(props) => (props.relevance === 2 || props.relevance === '2' ? '100%' : '150%')};
`;
export const VarUnit = styled.span<{relevance?: number | string }>`
  font-size: ${(props) => (props.relevance === 2 || props.relevance === '2' ? '85%' : '130%')};
  color: #8c8c8c;
  padding-left: 0.35em;
`;
export const CardContainer = styled.div`
  margin: 15px;
`;
export const VarContainer = styled.div`
  margin: 10px 0 10px 15px;
  min-width: 230px;
`;

export const CardElev = styled.div`
  margin-top: 24px;
  border-radius: 8px;
  border: 1px solid ${colors.Grey100};
`;

export const RealTimeBox = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Bluebar = styled.div`
  border-radius: 8px 8px 0 0;
  background-color: #363BC4;
  height: 20px;
  width: 100%;
`;

export const Sidebar = styled.div<{active?: string}>`
  border-radius: 8px 0 0 8px;
  background-color: ${({ active }) => (active === '1' ? '#363BC4' : colors.Grey200)};
  width: 15px;
`;

export const ConteinerTitle = styled.div`
  margin: 5px 0 10px 15px;
  min-width: 230px;

  h1 {
    color: black;
    font-weight: bold;
    font-size: 1.2rem;
  }
`;

export const ContentRealTime = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem 4rem 2rem 10rem;
  width: 400px;

    h3 {
      color: #8c8c8c;
      font-weight: bold;
    }

    span {
      display: flex;
      flex-direction: row;
      color: black;
      font-size: 1.7rem;
      font-weight: bold;

      p {
        color: #8c8c8c;
      }
    }
`;

export const WeekDayButton = styled.div<{ checked: boolean }>`
  padding: 8px 10px;
  border-radius: 5px;
  margin: 5px;
  background-color: ${({ checked }) => (checked ? colors.BlueSecondary : 'lightgrey')};
  color: ${({ checked }) => (checked ? 'white' : 'black')};
`;

export const ControlButtonIcon = styled.img<{ isActive?: boolean, status?: string }>`
  max-width: 100%;
  ${({ isActive }) => (isActive ? 'filter: brightness(10)' : '')};
  ${({ status }) => (status === 'ONLINE' ? '' : 'filter: contrast(0)')};
`;

export const ControlButtonIconFancoil = styled.img<{ isActive?: boolean, status?: string }>`
  width: 20%;
  ${({ isActive }) => (isActive ? 'filter: brightness(10)' : '')};
`;

export const ControlButton = styled.div<{ isActive?: boolean, noBorder?: boolean, larger?: boolean, disabled?: boolean }>`
  border: 1px solid ${colors.GreyDefaultCardBorder};
  ${({ noBorder }) => (noBorder ? 'border: 0;' : '')}
  border-radius: 10px;
  width: ${({ larger }) => (larger ? '120px' : '70px')};
  height: ${({ larger }) => (larger ? '45px' : '70px')};
  cursor: pointer;
  display: flex;
  ${({ larger }) => (larger ? 'padding: 0 11px;' : '')}
  align-items: center;
  justify-content: ${({ larger }) => (larger ? 'space-between' : 'center')};;
  ${({ isActive }) => (isActive ? `background-color: ${colors.BlueSecondary};` : '')}
  ${({ disabled }) => (disabled ? `background-color: ${colors.LightGrey_v3};` : '')}
  ${({ disabled }) => (disabled ? 'opacity: 0.14;' : '')}
`;

export const SelectContainer = styled.div`
  position: fixed;
  background: white;
  border: 1px solid #d3d3d3;
  border-radius: 10px;
`;

export const SchedCardContainer = styled.div`
  border: 1px solid ${colors.GreyDefaultCardBorder};
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
  width: auto;
  min-width: 450px;
`;

export const NotyNumStyle = styled.div`
  position: absolute;
  right: 0;
  background-color: #363BC4;
  font-size: 11px;
  color: white;
  display: inline;
  padding: 4px 8px;
  border-radius: 20px;
  font-weight: bold;
`;

export const NotyNumCornerStyle = styled.div`
  position: absolute;
  right: -10px;
  top: -10px;
  background-color: #363BC4;
  width: 22px;
  height: 22px;
  line-height: 22px;
  font-size: 12px;
  color: white;
  display: inline;
  border-radius: 10px;
  font-weight: bold;
  text-align: center;
  vertical-align: middle;
`;

export const NotyIconStyle = styled.div`
  position: relative;
  display: inline;
`;

export const Container = styled.div`
  display: inline-block;
  color: ${colors.DarkGrey};
  cursor: pointer;
`;

export const Slider = styled.div<{ checked }>`
  line-height: 0;
  display: inline-block;
  width: 45px;
  height: 25px;
  border-radius: 13px;
  padding-top: 2px;
  position: relative;
  -webkit-transition: .4s;
  transition: .4s;
  background-color: #ccc;
  ${({ checked }) => (checked ? 'padding-left: 21px;' : 'padding-left: 3px;')}
`;

export const Cursor = styled.div<{ onOff, checked }>`
  line-height: 0;
  display: inline-block;
  width: 21px;
  height: 21px;
  border: 0;
  border-radius: 50%;
  ${({ onOff, checked }) => {
    if (onOff) {
      return checked ? 'background-color: black;' : `background-color: ${colors.BlueSecondary};`;
    }
    return `background-color: ${colors.BlueSecondary};`;
  }}
`;

export const Line = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

export const Text = styled.span`
font-weight: normal;
font-size: 1em;
line-height: 26px;
color: ${colors.Grey400};
`;

export const ColoredLine = styled(LineIcon)(
  ({ color }) => `
    margin-left: 10px;
    color: ${color}
`,
);

export const WaterTooltip = styled.div`
  min-width: 230px;
  min-height: 100px;
  background: #FFFFFFF7;
  border: 1px solid #8c8c8c;
  border-radius: 4px;
  padding: 15px;

  > span {
    font-weight: bold;
    color: #000000;
  }

  > p {
    > strong {
      font-size: 150%;
    }
      margin-bottom: 0;
    > span {
      font-size: 130%;
      color: #8c8c8c;
      padding-left: 0.30em;
    }
   }
`;

export const Calendar = styled(CalendarIcon)`
  width: 1rem;
  height: 1rem;
  margin-right: 2px;
`;

export const Timer = styled(TimeIcon)`
  width: 1rem;
  height: 1rem;
  margin-right: 2px;
`;

export const ParamName = styled.div`
  font-weight: 700;
  font-size: 14px;
  color: #5B5B5B;
`;

export const ParamTitle = styled.h3`
font-weight: 700;
font-size: 16px;
`;

export const ParamValue = styled.div<{ isOk: boolean }>`
  font-weight: 700;
  font-size: 14px;
  padding-bottom: 10px;
  ${({ isOk }) => (isOk ? 'color:  #5B5B5B' : 'color :  #5B5B5B')};
`;

export const TextLine = styled.div`
  display: flex;
  align-items: center;
  color: #5d5d5d;
`;

export const SetpointButton = styled.div<{ up?: boolean, down?: boolean }>`
  flex-basis: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #D7D7D7;
  user-select: none;
  ${({ up }) => (up ? 'border-bottom: 1px solid #D7D7D7' : '')}
  ${({ down }) => (down ? 'border-top: 1px solid #D7D7D7' : '')}
`;

export const ModalContainerLoading = styled.div<{display?: boolean }>`
  ${({ display }) => (display ? 'display: block' : 'display: none')}
  padding-top: 20%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #fcfdfcd9;
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  color: #5B5B5B;
  font-size: 14px;
  text-align: center;
  gap: 8px;
  cursor: wait;
  pointer-events: none;
  h4 {
    margin: 0px;
  }
`;

export const IconWrapper = styled.div`
  display: inline-block;
  width: 21px;
  height: 27px;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  svg {
    width: 21px;
    height: 27px;
  }
`;
