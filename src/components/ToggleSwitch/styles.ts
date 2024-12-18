import styled from 'styled-components';

import { colors } from '../../styles/colors';

export const Slider = styled.div<{ width, checked, variant }>`
  line-height: 0;
  display: inline-block;
  width: ${({ width }) => width}px;
  height: 26px;
  border-radius: 13px;
  padding-top: 5px;
  position: relative;
  -webkit-transition: .4s;
  transition: .4s;
  ${({ checked, variant }) => {
    if (variant) {
      return 'background-color: #ccc;';
    }
    return (checked ? `background-color: ${colors.BlueSecondary};` : 'background-color: #ccc;');
  }}
  ${({ checked, width }) => (checked ? `padding-left: ${(width - 21)}px;` : 'padding-left: 4px;')}
`;

export const StateLabelChecked = styled.span<{width}>`
  font-size: 60%;
  text-align: center;
  position: absolute;
  line-height: normal;
  width: ${({ width }) => (width - 30)}px;
  left: 5px;
  top: 7px;
  color: black;
`;

export const StateLabelUnchecked = styled.span<{width}>`
  font-size: 60%;
  text-align: center;
  position: absolute;
  line-height: normal;
  width: ${({ width }) => (width - 30)}px;
  left: 23px;
  top: 7px;
  color: black;
`;

export const Cursor = styled.div<{ checked, variant }>`
  line-height: 0;
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 0;
  border-radius: 50%;
  ${({ checked, variant }) => {
    if (variant) {
      return (checked ? 'background-color: green;' : 'background-color: red;');
    }
    return 'background-color: #fff;';
  }}
`;

export const Container = styled.div<{ disabled }>`
  display: inline-block;
  color: ${colors.DarkGrey};
  cursor: pointer;

  ${({ disabled }) => (disabled ? `
    pointer-events: none;
    opacity: 0.3;
  ` : '')}
`;

export const SliderMini = styled.div<{ checked }>`
  line-height: 0;
  display: inline-block;
  width: 30px;
  height: 16px;
  border-radius: 13px;
  padding-top: 2px;
  position: relative;
  -webkit-transition: .4s;
  transition: .4s;
  background-color: #ccc;
  ${({ checked }) => (checked ? 'padding-left: 16px;' : 'padding-left: 2px;')}
`;

export const CursorMini = styled.div<{ onOff, checked }>`
  line-height: 0;
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 0;
  border-radius: 50%;
  ${({ onOff, checked }) => {
    if (onOff) {
      return checked ? 'background-color: black;' : `background-color: ${colors.BlueSecondary};`;
    }
    return `background-color: ${colors.BlueSecondary};`;
  }}
`;
