import { Space } from 'antd';
import { Link } from 'react-router-dom';
import { Flex } from 'reflexbox';
import styled from 'styled-components';
import { ModalWindow } from '~/components';
import { colors } from '~/styles/colors';

export const SearchInput = styled.div<{disabled?}>(
  ({ disabled }) => `
  margin: 0;
  font-size: 12px;
  margin-left: 16px;
  color: #000;
  width: 100%;
  border: 1px solid ${disabled ? 'rgba(233, 233, 233, 0.7)' : '#BABABA'};
  border-radius: 8px;
  box-sizing: border-box !important;
  display: inline-flex;
  background-color: #fff; 
  height: 20px;
`,
);

export const ArrowButton = styled.div<{ orientation: string }>(
  ({ orientation }) => `
  display: flex;
  width: 25px;
  justify-content: center;
  align-items: center;
  ${orientation === 'right' ? 'border-left: 0px;' : ''}
  ${orientation === 'left' ? 'border-right: 0px;' : ''}
  &:hover {
    background-color: #F5F5F5;
    cursor: pointer;
  }
`,
);

export const Label = styled.span`
  position: relative;
  display: inline-block;
  margin-left: 16px;
  margin-right: 16px;
  color: #202370;
  font-size: 11px;
  font-weight: bold;
`;

export const StatusIcon = styled.div<{ color?, status?}>(
  ({ color, status }) => `
  width: 10px;
  height: 10px;
  margin-left: 5px;
  border-radius: 50%;
  border: 2px solid ${color || (status === 'ONLINE' ? colors.Blue300 : colors.Grey200)};
  background: ${color || (status === 'ONLINE' ? colors.Blue300 : colors.Grey200)};
  font-weight: bold;
  font-size: 0.8em;
  line-height: 18px;
  color: ${colors.White};
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: capitalize;
`,
);

export const CleanBtn = styled.div`
  cursor: pointer;
  position: relative;
  bottom: 2;
  left: 18;
  display: inline-block;
  color: ${colors.BlueSecondary};
  margin-top: 5px;
  margin-left: 18px;
  text-decoration: underline;
  font-size: 11px;

  &:hover {
    color: ${colors.Blue400};
  }
`;

export const Text = styled.span`
  font-size: 11px;
  color: ${colors.Grey400};
`;

export const CheckboxLine = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-left: 18px;
  gap: 5px;
`;

export const ExportBtn = styled.div<{ disabled?: boolean }>(
  ({ disabled }) => `
  opacity: ${disabled ? '0.4' : '1'}
  pointer-events: ${disabled ? 'none' : 'auto'};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border: 1px solid ${colors.GreyDefaultCardBorder};
  border-radius: 10px;
  padding: 6px 10px;

  &:hover {
    cursor: pointer;
    background-color: ${colors.BlueSecondary};
    color: white;
    svg path {
      fill: white !important;
    }
  }`,
);

export const TempGreat = styled.span`
  width: 15px;
  height: 5px;
  background: ${colors.GreenLight};
  border-radius: 3px;
  display: inline-grid;
  margin-left: 4px;
`;

export const TempLow = styled.span`
  width: 15px;
  height: 5px;
  background: ${colors.BlueSecondary_v3};
  border-radius: 3px;
  display: inline-grid;
  margin-left: 4px;
`;

export const TempHigh = styled.span`
  width: 15px;
  height: 5px;
  background: ${colors.RedDark};
  border-radius: 3px;
  display: inline-grid;
  margin-left: 4px;
`;

export const NoTempData = styled.span`
  width: 15px;
  height: 5px;
  background: ${colors.Grey_v3};
  border-radius: 3px;
  display: inline-grid;
  margin-left: 4px;
`;

export const ControlFilter = styled.div`
  border: 1px solid #E9E9E9;
  border-radius: 8px;
  background-color: #ffffff;
  padding: 6px 5px;
  user-select: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  word-break: normal;
  z-index: 1;
  box-shadow: 0 2px 4px 1px rgba(0, 0, 0, 0.1);
  &:hover {
    cursor: pointer;
    background-color: ${colors.BlueSecondary};
    color: white;
    svg path {
      fill: white !important;
    }
  }
`;

export const OptionExportList = styled.a`
  display: flex;
  height: 150px;
  width: 290px;
  border: 1px solid rgba(197, 197, 197, 0.56);
  border-radius: 5px;
  gap: 10px;
  align-items: center;
  justify-content: center;

  font-family: 'Inter';
  font-size: 13px;
  color: black;
`;

export const HoverExportList = styled.div`
  display: flex;
  width: 170px;
  /* border-radius: 5px; */
  color: white;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-size: 11px;
  line-height: 13px;

`;

export const ContainerArea = styled.div`
  width: '100%',
  padding-top: 3;
  padding-bottom: 3;
  min-width: '80px';
  .select-search__input {
    font-size: 12px;
    height: 15px;
  }
  .select-search:not(.is-loading):not(.select-search--multiple) .select-search__value::after {
    --r:1px;
    width: 10px;
    top: 4px
    aspect-ratio: 1 / cos(30deg);
    --_g: calc(tan(60deg) * var(--r)) top var(--r), #ff0505 98%, transparent 101%;

    -webkit-mask:
      conic-gradient(from 150deg at 50% calc(3 * var(--r) / 2 - 100%), #202370 60deg, transparent 0)
      0 0 / 100% calc(100% - 3 * var(--r) / 2) no-repeat,
      radial-gradient(var(--r) at 50% calc(100% - 2 * var(--r)), #202370 98%, transparent 101%),
      radial-gradient(var(--r) at left var(--_g)),
      radial-gradient(var(--r) at right var(--_g));

    -webkit-clip-path: polygon(50% 100%, 100% 0, 0 0);
    clip-path: polygon(50% 100%, 100% 0, 0 0);

    background: #202370;
    transform: translateY(-50%);
    border: none;
  }

  .select-search__option {
    height: auto;
    min-height: 36px;
  }

  .select-search__select {
    width: 225px;
  }
`;

export const ContainerDate = styled.div`
    display: flex;
    gap: 10px;
    justify-content: center;
    align-items: center;
  `;

export const DateLabel = styled.span`
  transition: all 0.2s;
  margin-left: 14px;
  margin-right: 5px;

  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-size: 11px;
  line-height: 13px;
  color: #202370;
`;

export const DividerDate = styled.div`
  margin-inline: 15px;
  height: 36px;
  width: 2px;
  background-color: rgba(0, 0, 0, 0.17);
`;

export const CancelButton = styled.span`
  display: flex;
  width: max-content;
  padding: 10px;
  font-family: 'Inter';
  font-size: 11px;
  line-height: 13px;
  color: #6C6B6B;
  text-decoration-line: underline;
  margin-top: 50px;
`;

export const ContentSearch = styled.div`
.select-search:not(.select-search--multiple) .select-search__select {
      position: absolute;
      z-index: 2;
      right: 0;
      left: 0;
      margin-right: -20px;
  }
`;

export const ContentDate = styled.div`
  position: relative;
  border: 1px solid #BABABA;
  border-radius: 8px;
  height: 41px;
  width: 226px;
  background-color: white;
  margin-left: 15px;
  .CalendarDay__selected_span {
    background: #D0D2F1;
    border: 1px double #F4EBEB;
    color: #000;
  }
  .react-datepicker__month-text--keyboard-selected {
    background-color: ${colors.BlueSecondary};
  }
  .react-datepicker__triangle {
    left: -130px !important;
  }
  .react-datepicker__header {
    background-color: white;
    border-bottom: none;
  }
  .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::after {
    border-bottom-color: white;
  }
  .react-datepicker-wrapper {
    display: block;
    .react-datepicker__input-container {
      input[type="text"] {
        border: none;
        font-size: 12px;
        outline: none;
        line-height: 19px;
        padding-left: 14px;
        color: #464555;
      }
    }
  }
  .SingleDatePicker_picker {
    z-index: 999;
  }
  .SingleDatePicker {
    display: block;
    position: initial;
  }
  .SingleDatePickerInput {
    display: block;
    position: relative;
    border: none;
    .DateInput {
      display: block;
      position: relative;
      width: 100%;
      .DateInput_input {
        outline: none;
        font-size: 12px;
        padding-left: 14px;
        color: ${colors.Grey400};
        width: 100%;
      }
      .DateInput_input__focused {
        border: none;
      }
    }
  }

  .DateRangePickerInput {
    .DateRangePickerInput_1
      display: flex;
    }
  }

  .DateRangePickerInput_arrow_svg {
    vertical-align: super;
    height: 15px;
    width: 24px;
  }

  .DateRangePicker{
    margin-top: -5px;
    .DateRangePicker_1 {
      height: 2px;
    }
  
  } 

  .DateRangePickerInput {
    height: 2px;
    .DateRangePickerInput_arrow {
      width: 10px;
    }
    .DateRangePickerInput_1 {
      height: 2px;
    }
    .DateInput {
    vertical-align: text-bottom;
    background: transparent;
    width: 105px;
      .DateInput_input {
        outline: none;
        font-size: 12px;
        line-height: 19px;
        padding: 0px 0px 0px 14px;
        color: ${colors.Grey400};
        vertical-align: text-bottom;
        background: transparent;
      }
      .DateInput_input__focused {
        border: none;
      }
    }
  }
  .DateInput_fang {
    z-index: 1;
  }
  .SingleDatePicker_picker {
    width: 100%;
  }
  .CalendarDay__selected,
  .CalendarDay__selected:active {
    background: ${colors.BlueSecondary};
    border: 1px double ${colors.BlueSecondary};
    color: ${colors.White};
    font-weight: bold;
  }
  .CalendarDay__selected:hover {
    background: ${colors.BlueSecondary};
    border: 1px double ${colors.BlueSecondary};
    color: ${colors.Black};
  }
  .DayPickerKeyboardShortcuts_show__bottomRight::before {
    border-right: 33px solid ${colors.BlueSecondary};
  }
  .DayPickerKeyboardShortcuts_show__bottomRight:hover::before {
    border-right: 33px solid ${colors.BlueSecondary};
  }
  .CalendarDay__hovered_span {
    background: ${colors.BlueSelectedSpan};
    border: 1px double ${colors.BlueSelectedSpan};
    color: ${colors.White};
  }
  CalendarDay__hovered_span:hover {
    background: ${colors.BlueSelectedSpan};
    border: 1px double ${colors.BlueSelectedSpan};
    color: ${colors.White};
  }
  .CalendarDay__hovered_span_3 {
    background: ${colors.BlueSelectedSpan};
    border: 1px double ${colors.BlueSelectedSpan};
    color: ${colors.White};
  }
  .CalendarDay__hovered_span_3:hover {
    background: ${colors.BlueSelectedSpan};
    border: 1px double ${colors.BlueSelectedSpan};
    color: ${colors.White};
  }

  .CalendarMonth_caption {
    color: #000;
    text-transform: capitalize;
  }
  .DayPickerKeyboardShortcuts_show__bottomRight::before {
    display: none;
  }
  .CalendarDay__hovered_span, .CalendarDay__hovered_span:hover {
    background: #E5E6F8;
    border: 1px double #F4EBEB;
    color: #000;
  }
  .CalendarDay__selected_span:hover {
    background: #B5B7DD;
    border: 1px double #B5B7DD;
    color: #fff;
  }
`;

export const ContainerDateNew = styled.div<{disabled?}>(
  ({ disabled }) => `
  opacity: ${disabled ? '0.4' : '1'};
  display: flex;
  background: #FFF;
  border: 1px solid #BABABA;
  border-radius: 8px;
  height: 41px;
  margin-left: 15px;
  `,
);

export const ContentDateNew = styled.div`
  position: relative;
  background: transparent;
  width: 174px;
  border-left: 1px solid #BABABA;
  border-right: 1px solid #BABABA;
  .react-datepicker__month-text--keyboard-selected {
    background-color: ${colors.BlueSecondary};
    color: white;
  }
  .CalendarMonth_caption {
    text-transform: capitalize;
  }
  .react-datepicker__triangle {
    left: -130px !important;
  }
  .react-datepicker__header {
    background-color: white;
    border-bottom: none;
  }

  .react-datepicker-popper {
    z-index: 99;
  }
  .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::after {
    display: none;
  }

  .react-datepicker-popper[data-placement^=bottom] .react-datepicker__triangle::before {
    display: none;
  } 
  .react-datepicker-wrapper {
    display: block;
    .react-datepicker__input-container {
      top: -5px;
      input[type="text"] {
        border: none;
        font-size: 12px;
        outline: none;
        line-height: 19px;
        padding: 0px 40px 0px 14px;
        color: #464555;
        background: transparent;
      }
    }
  }
  .SingleDatePicker {
    display: block;
    position: initial;
  }
  .SingleDatePickerInput {
    display: block;
    position: relative;
    border: none;
    background: transparent;
    top: -5px;
    .DateInput {
      display: block;
      position: relative;
      width: 100%;
      background: transparent;
      .DateInput_input {
        outline: none;
        font-size: 12px;
        line-height: 19px;
        padding: 0px 40px 0px 14px;
        color: ${colors.Grey400};
        width: 100%;
        background: transparent;
        border: none;
      }
      .DateInput_input__focused {
        border: none;
      }
    }
  }
  .DateRangePickerInput {
    .DateRangePickerInput_arrow {
      width: 60px;
    }
    .DateInput {
      .DateInput_input {
        outline: none;
        font-size: 12px;
        line-height: 19px;
        padding: 0px 40px 0px 14px;
        color: ${colors.Grey400};
      }
      .DateInput_input__focused {
        border: none;
      }
    }
  }
  .DateInput_fang {
    z-index: 1;
  }
  .SingleDatePicker_picker {
    width: 100%;
  }
  .CalendarDay__selected,
  .CalendarDay__selected:active {
    background: ${colors.BlueSecondary};
    border: 1px double ${colors.BlueSecondary};
    color: ${colors.White};
    font-weight: bold;
  }
  .CalendarDay__selected:hover {
    background: ${colors.BlueSecondary};
    border: 1px double ${colors.BlueSecondary};
    color: ${colors.Black};
  }
  .DayPickerKeyboardShortcuts_show__bottomRight::before {
    border-right: 33px solid ${colors.BlueSecondary};
  }
  .DayPickerKeyboardShortcuts_show__bottomRight:hover::before {
    border-right: 33px solid ${colors.BlueSecondary};
  }

  .DayPickerKeyboardShortcuts_show__bottomRight::before {
    display: none;
  }
`;

export const ContainerCheckbox = styled.div`
  display: flex;
  width: 33%;
  font-size: 13px;
  align-items: center;
  margin-bottom: 19px;
`;

export const SpaceStyled = styled(Space)`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

export const ModalWindowStyled = styled(ModalWindow)`
  padding: 0px;
  margin-bottom: auto;
  margin-top: 8%;
  width: 760px;
  z-index: 5;
`;

export const ContainerModal = styled(Flex)`
  padding-inline: 85px;
  padding-block: 40px;
  min-width: 633px;
  flex-direction: column;
`;

export const TitleModal = styled.span`
  font-family: 'Inter';
  font-weight: 700;
  font-size: 14px;
  line-height: 17px;
`;

export const SubtitleModal = styled.span`
  font-family: 'Inter';
  font-size: 12px;
  line-height: 15px;
  margin-bottom: 29px;
`;

export const FiltersContainer = styled(Flex)<{ showFilter?: boolean }>(({ showFilter }) => `
width: 100%;
flex-direction: row;
justify-content: center;
align-items: flex-start;
border-bottom: ${showFilter ? `2px solid ${colors.Grey100}` : 'none'}; 
padding: ${`24px 20px ${showFilter ? '16px' : '0'} 20px`};
background-color: ${showFilter ? '#f8f8f8' : '#ffffff'};
`);

export const TransparentLink = styled(Link)<{ checked?: boolean }>(({ checked }) => `
    display: flex;
    align-items: center;
    padding: 0 6px;
    color: inherit;
    text-decoration: inherit;
    background-color: ${checked ? '#363BC4' : '#FFFFFF'};
    :hover {
      color: ${colors.Black};
      text-decoration: none;
      cursor: pointer;
    }
  `);

export const RowCheckbox = styled.div<{ colorCheckbox? }>(
  ({ colorCheckbox }) => `
    display: flex;
    flex-direction: row;
    .MuiCheckbox-colorPrimary.Mui-checked {
      color: ${colorCheckbox ?? 'white'} !important;
    }
  `,
);

export const SelectWithCheckbox = styled.div<{disabled?}>(
  ({ disabled }) => `
  margin: 0;
  font-size: 12px;
  margin-left: 16px;
  color: #000;
  width: 100%;
  border: 1px solid ${disabled ? 'rgba(233, 233, 233, 0.7)' : '#BABABA'};
  border-radius: 8px;
  box-sizing: border-box !important;
  display: inline-flex;
  background-color: #fff; 
  width: 226px;
  border-radius: 8px;
  height: 41px;
  padding: 2px 0px;
  
  .select-search__option.is-selected {
    background: transparent;
    color: #000;
  }

  .select-search__option.is-highlighted,
  .select-search__option:not(.is-selected):hover {
      background: rgba(54, 59, 196, 0.34);
  }

  .select-search__option.is-highlighted.is-selected,
  .select-search__option.is-selected:hover {
      background: rgba(54, 59, 196, 0.34);
      color: #000;
  }

`,
);
