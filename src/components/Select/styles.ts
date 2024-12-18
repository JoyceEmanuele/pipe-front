import styled from 'styled-components';

import { ExpandIcon } from '../../icons';
import { colors } from '../../styles/colors';
import { Box } from 'reflexbox';

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
  margin-top: 10px;
  min-width: 40%;
  max-width: 70%;
  border-radius: 5px;
`;

export const HaveSelectAllSelectedContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 25px;
  border-radius: 5px;
`;

export const Selected = styled.span`
  font-weight: bold;
  font-size: 0.75em;
  margin-left: 5px;
  color: ${colors.Blue300};
`;

export const EmptyLabel = styled.div`
  height: 19px;
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 48px;
  width: 100%;
`;

export const Arrow = styled(ExpandIcon)<{ isOpen: boolean }>(
  ({ isOpen }) => `
  transform: rotate(${isOpen ? '180' : '360'}deg);
  transition: all 0.2s;
  margin: 14px 16px 14px 5px;
`,
);

export const ContainerIcon = styled(Box)<{ isOpen: boolean }>(
  ({ isOpen }) => `
  transform: rotate(${isOpen ? '180' : '360'}deg);
  transition: all 0.2s;
  padding-inline: 10px
`,
);

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

export const Base = styled.div<{ error: boolean, disabled?: boolean, isOpen: boolean, isSelected: boolean, onClick?:() => void, small?: boolean }>(
  ({
    error, disabled, isOpen, isSelected, small,
  }) => `
  box-sizing: border-box;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 40px;
  max-height: ${small ? '40px' : 'none'};
  ${disabled ? 'cursor: not-allowed;' : 'cursor: pointer;'}
  ${error ? `border: 1px solid ${colors.Red};` : ''}
  border: ${isOpen ? `1px solid ${colors.Blue700}` : '1px solid #E0E0E0'};
  border-radius: ${isOpen ? '5px 5px 0px 0px' : '5px'};
  color: ${isSelected ? '#000' : 'rgba(62, 71, 86, 0.3)'};
  ${disabled ? 'color: rgba(62, 71, 86, 0.2);' : ''}
`);

export const Label = styled.span<{ error: boolean, isSelected: boolean, isOpen: boolean, disabled?: boolean, small?: boolean }>(
  ({
    error, isSelected, isOpen, disabled, small,
  }) => `
  transition: all 0.2s;
  margin-left: 16px;
  color: ${error ? colors.Red : colors.Grey300};
  ${(isOpen || isSelected)
    && `
    margin-top: -6px;
    margin-top: ${small ? '0px' : '-6px'};
    margin-left: 16px;
    margin-right: 16px;
    color: ${colors.Blue700};
    font-size: 11px;
    font-weight: bold;
  `}
  ${disabled ? `color: ${colors.Grey200};` : ''}
`,
);

export const LabelPlaceholder = styled.span`
  transition: all 0.2s;
  margin-top: -6px;
  margin-left: 16px;
  margin-right: 16px;
  color: ${colors.Blue700};
  font-size: 11px;
  font-weight: bold;
`;

export const FuzzySearchLabel = styled.span<{ error: boolean, isSelected: boolean, isOpen: boolean, disabled?: boolean }>(
  ({
    error, isSelected, isOpen, disabled,
  }) => `
  position: absolute;
  left: 16px;
  top: 30%;
  transition: all 0.2s;
  color: ${error ? colors.Red : colors.Grey300};
  ${(isOpen || isSelected)
    && `
    left: 16px;
    top: 4px;
    margin-right: 16px;
    color: ${colors.Blue700};
    font-size: 11px;
    font-weight: bold;
  `}
  ${disabled ? `color: ${colors.Grey200};` : ''}
`,
);

export const Input = styled.input<{ error: boolean, isSelected: boolean, isOpen: boolean, disabled?: boolean }>(
  ({
    error, isSelected, isOpen, disabled,
  }) => `
  width: 100%;
  height: 45px;
  padding: 16px 0 0 16px;
  transition: all 0.2s;
  color: ${error ? colors.Red : colors.GreyDark};
  outline: none;
  border-style: none;
  ${(isOpen || isSelected)
    && `
    font-size: 12px;
    font-weight: bold;
  `}
  ${disabled ? `color: ${colors.Grey200};` : ''}
`,
);

export const SelectedLabel = styled.span<{ disabled, small?: boolean }>(({ disabled, small }) => `
  font-size: 12px;
  margin-left: 16px;
  margin-bottom: ${small ? '0px' : '-6px'};
  margin-top: ${small ? '0px' : '7px'};
  color: ${colors.Black};
  ${disabled ? `color: ${colors.Grey200};` : ''}
`);

export const FuzzySearchSelectedLabel = styled.span<{ disabled }>(({ disabled }) => `
  position: absolute;
  font-size: 12px;
  margin-left: 16px;
  margin-bottom: -6px;
  margin-top: 7px;
  color: ${colors.Black};
  ${disabled ? `color: ${colors.Grey200};` : ''}
`);

export const ListItem = styled.div<{ isSelected: boolean }>(
  ({ isSelected }) => `
  position: relative;
  min-height: 48px;
  padding: 14px 16px;
  cursor: pointer;
  &:hover {
    background-color: ${isSelected ? '' : colors.Grey050};
  }
  span {
    font-size: 0.875em;
    color: ${isSelected ? colors.Grey400 : colors.Grey300};
  }
`,
);
export const List = styled.div<{ removeScroll?: boolean }>`
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

  ${({ removeScroll }) => removeScroll && `
    ::-webkit-scrollbar {
      width: 0px;
      height: 0px;
      background: transparent;
    }

    -ms-overflow-style: none;
    scrollbar-width: none;
  `}

  ${ListItem} {
    &:last-child {
      border-radius: 0px 0px 8px 8px;
      box-shadow: 0px 7px 12px rgba(83, 104, 111, 0.12), 0px 11px 15px rgba(85, 97, 115, 0.1);
      position: relative;
    }
  }
`;

export const LimitBoxInfo = styled.p`
  position: -webkit-sticky; /* Para compatibilidade com navegadores mais antigos */
  position: sticky;
  bottom: 0px;
  text-align: center;
  background-color: white;
  z-index: 10;
  padding: 5px;
  color: rgba(160, 160, 160, 1);
  display: flex;
  gap: 5;
  justify-content: center;
  align-items: center;
  svg {
    margin-right: 4px;
  }
`;

export const BlueBar = styled.div<{ isLast: boolean }>(
  ({ isLast }) => `
  width: 4px;
  height: 48px;
  background-color: ${colors.Blue300};
  position: absolute;
  top: 0;
  left: 0;
  ${isLast && 'border-bottom-left-radius: 8px'}
`,
);

export const Error = styled.span`
  color: ${colors.Red};
  display: block;
  margin: 0;
  text-align: left;
  font-size: 0.75em;
  height: 24px;
`;

export const CheckboxLine = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

export const Text = styled.label`
  font-weight: normal;
  font-size: 1em;
  line-height: 26px;
  color: ${colors.Grey400};
  cursor: pointer;
`;
