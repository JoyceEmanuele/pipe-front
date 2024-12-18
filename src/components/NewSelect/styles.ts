import styled from 'styled-components';

import { ExpandIcon } from '../../icons';
import { colors } from '../../styles/colors';

export const IconWrapper = styled.div<{ disabled }>(({ disabled }) => `
  display: flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 16px;
  ${disabled ? 'cursor: not-allowed;' : 'cursor: pointer;'}
`);

export const SelectedContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px;
  height: 25px;
  margin-top: 5px;
  min-width: 40%;
  max-width: 80%;
  border-radius: 5px;
`;

export const Selected = styled.span`
  font-weight: bold;
  font-size: 0.75em;
  margin-left: 5px;
  color: ${colors.Blue300};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const EmptyLabel = styled.div`
  height: 19px;
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 48px;
  width: calc(100% - 34px);
`;

export const Arrow = styled(ExpandIcon)<{ isOpen: boolean }>`
  transform: rotate(${(props) => (props.isOpen ? '180' : '360')}deg);
  transition: all 0.2s;
  margin: 14px 16px 14px 5px;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

export const Base = styled.div<{ error: string | undefined, disabled: boolean | undefined, isOpen: boolean, isSelected: boolean, onClick:() => void }>`
  box-sizing: border-box;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 48px;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  border: ${(props) => {
    let borderProperty = '1px solid ';
    if (props.error) borderProperty += colors.Red;
    else props.isOpen ? borderProperty += colors.Blue700 : borderProperty += colors.GreyInputBorder;
    return `${borderProperty};`;
  }};
  border-radius: ${(props) => (props.isOpen ? '5px 5px 0px 0px' : '5px')};
  color: ${(props) => {
    if (props.disabled) return 'rgba(62, 71, 86, 0.2);';
    return props.isSelected ? '#000;' : 'rgba(62, 71, 86, 0.3);';
  }};
`;

export const Label = styled.span<{ error: string | undefined, isSelected: boolean | undefined, isOpen: boolean, disabled: boolean | undefined }>(
  ({
    error, isSelected, isOpen, disabled,
  }) => `
  transition: all 0.2s;
  margin-left: 16px;
  font-size: 12px;
  position: absolute;
  font-weight: bold;
  top: 5px;
  color: ${error ? colors.Red : colors.Blue700};
  ${disabled ? `color: ${colors.Grey200};` : ''}
  ${(isOpen || isSelected)
    && `
    top: 2px;
    margin-left: 16px;
    margin-right: 16px;
    color: ${colors.Blue700};
    font-size: 12px;
  `}
`,
);

export const SelectedLabel = styled.span<{ disabled }>(({ disabled }) => `
  font-size: 12px;
  margin-left: 16px;
  margin-bottom: -6px;
  margin-top: 7px;
  color: ${colors.Black};
  ${disabled ? `color: ${colors.Grey200};` : ''}
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`);

export const ListItem = styled.div<{ isSelected: boolean }>`
  position: relative;
  height: 48px;
  padding: 14px 16px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.isSelected ? '' : colors.Grey050)};
  }

  span {
    font-size: 0.875em;
    color: ${(props) => (props.isSelected ? colors.Grey400 : colors.Grey300)};
  }
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${colors.White};
  min-height: 48px;
  position: absolute;
  top: 103%;
  width: 100%;
  z-index: 10;
  height: auto;
  max-height: 316px;
  overflow-y: scroll;
  box-shadow: 0px 7px 12px rgba(83, 104, 111, 0.12), 0px 11px 15px rgba(85, 97, 115, 0.1);

  ${ListItem} {
    &:last-child {
      border-radius: 0px 0px 8px 8px;
      box-shadow: 0px 7px 12px rgba(83, 104, 111, 0.12), 0px 11px 15px rgba(85, 97, 115, 0.1);
    }
  }
`;

export const BlueBar = styled.div<{ isLast: boolean }>`
  width: 4px;
  height: 48px;
  background-color: ${colors.Blue300};
  position: absolute;
  top: 0;
  left: 0;
  border-bottom-left-radius: ${(props) => props.isLast && '8px;'};
`;

export const Error = styled.span`
  color: ${colors.Red};
  display: block;
  margin: 5px;
  text-align: left;
  font-size: 0.75em;
  height: 24px;
`;
