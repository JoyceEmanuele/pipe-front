import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const NotyNumStyle = styled.div`
  position: absolute;
  right: 10px;
  top: -10px;
  background-color: #363BC4;
  font-size: 11px;
  color: white;
  display: inline;
  padding: 2px 8px;
  border-radius: 25px;
  font-weight: bold;
`;

export const NotyIconStyle = styled.div`
  width: 180px;
  position: relative;
  display: inline;
`;

export const ControlButtonIcon = styled.img<{ isActive?: boolean, status?: string }>`
  width: 13%;
  ${({ isActive }) => (isActive ? 'filter: brightness(10)' : '')};
  ${({ status }) => (status === 'ONLINE' ? '' : 'filter: contrast(0)')};
`;

export const ControlButton = styled.div<{ isActive?: boolean, noBorder?: boolean }>`
  border: 1px solid ${colors.GreyDefaultCardBorder};
  ${({ noBorder }) => (noBorder ? 'border: 0;' : '')}
  border-radius: 10px;
  width: 160px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  ${({ isActive }) => (isActive ? `background-color: ${colors.BlueSecondary};` : '')}
`;

export const Data = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;
export const DataText = styled.span<{ fontWeight? }>(
  ({ color = colors.Grey400, fontWeight = 'normal' }) => `
  font-size: 12px;
  font-weight: ${fontWeight};
  color: ${color};
`,
);
export const Title = styled.h1`
  font-size: 1.25em;
  color: #363BC4;
  font-weight: bold;
  margin-bottom: 16px;
`;

export const NotyNumStyleMini = styled.div`
  position: absolute;
  right: 0px;
  top: -10px;
  background-color: #363BC4;
  font-size: 11px;
  color: white;
  display: inline;
  padding: 4px 8px;
  border-radius: 20px;
  font-weight: bold;
`;

export const NotyIconStyleMini = styled.div`
  position: relative;
  display: inline;
`;

export const ControlButtonIconMini = styled.img<{ isActive?: boolean, status?: string }>`
  max-width: 100%;
  ${({ isActive }) => (isActive ? 'filter: brightness(10)' : '')};
  ${({ status }) => (status === 'ONLINE' ? '' : 'filter: contrast(0)')};
`;

export const ControlButtonMini = styled.div<{ isActive?: boolean, noBorder?: boolean }>`
  border: 1px solid ${colors.GreyDefaultCardBorder};
  ${({ noBorder }) => (noBorder ? 'border: 0;' : '')}
  border-radius: 10px;
  width: 70px;
  height: 70px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ isActive }) => (isActive ? `background-color: ${colors.BlueSecondary};` : '')}
`;

export const TextLine = styled.div`
  display: flex;
  align-items: center;
  color: #5d5d5d;
`;

export const WeekDayButton = styled.div<{ checked: boolean, status?: string, size?: 'small' }>`
  padding: 8px 10px;
  border-radius: 5px;
  margin: 5px;
  background-color: ${({ checked, status }) => (checked ? (status === '0' ? '#B5B5B5' : colors.BlueSecondary) : 'lightgrey')};
  color: ${({ checked }) => (checked ? 'white' : 'black')};
  ${({ size }) => size === 'small' && (`
    width: 34px;
    height: 37px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    `
  )}
`;

export const SelectContainer = styled.div`
  position: fixed;
  background: white;
  border: 1px solid #d3d3d3;
  border-radius: 10px;
`;

export const SchedCardContainer = styled.div<{size?: 'small'}>`
  border: 1px solid ${colors.GreyDefaultCardBorder};
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
  width: auto;
  min-width: 300px;
  width: ${({ size }) => (size === 'small' ? '346px' : '100%')};
  ${({ size }) => size === 'small' && (`
    height: 300px;
  `)}
`;

export const Sidebar = styled.div<{active?: string}>`
  border-radius: 8px 0 0 8px;
  background-color: ${({ active }) => (active === '1' ? '#363BC4' : colors.Grey200)};
  width: 15px;
`;

export const DefaultModeContainer = styled.div`
  border: 1px solid #818181;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 200px;
  height: 50px;
  margin: 20px;
  span{
    margin-left: 15px;
  }

`;

export const LinkButton = styled.button`
  padding: 0;
  margin: 0;
  border: 0;
  cursor: pointer;
  text-decoration: underline;
  color: ${colors.BlueSecondary};
  background: white;
`;

export const TabButton = styled.button`
  margin: 0;
  border: 0;
  border-right: '1px solid lightgrey';
  border-left: '1px solid lightgrey';
  text-align: 'center';
  font-size: '90%';
  padding: '4px 1px';
`;
