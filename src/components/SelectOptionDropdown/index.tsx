import moment from 'moment';
import {
  Dropdown,
  DropdownContent,
  DropdownHeader,
  DropdownOption,
  DropdownYearButtons,
  SelectOptionDropdownWrapper,
} from './styles';
import { ClickAwayListener } from '@material-ui/core';
import { ArrowLeftIcon, ArrowRightIcon } from '~/icons';
import { capitalizeFirstLetter } from '~/helpers/capitalizeFirstLetter';

const YEAR_MODE = 'yearMode';
const MONTH_MODE = 'monthMode';

interface SelectOptionDropdownProps {
  open: boolean;
  handleClickOutside: () => void;
  yearSelected: string;
  monthSelected: string;
  yearOptions: {
    label: string;
    value: string | number;
    hasData: boolean;
  }[];
  monthOptions: {
    label: string;
    value: string | number;
    hasData: boolean;
  }[];
  mode: string;
  isLoading: boolean;
  handleChangeDate: (value: string) => void;
  children: React.ReactNode;
}

export const SelectOptionDropdown: React.FC<SelectOptionDropdownProps> = ({
  open,
  yearSelected,
  monthSelected,
  yearOptions,
  monthOptions,
  mode,
  handleClickOutside,
  handleChangeDate,
  isLoading,
  children,
}) => {
  const handleGetYearIndex = (label) => yearOptions.findIndex((year) => moment.utc(year.value).isSame(moment(label, 'YYYY'), 'year'));

  const handleGetMonthIndex = (monthLabel, yearLabel) => monthOptions.findIndex((month) => moment
    .utc(month.value)
    .isSame(moment(`${monthLabel} ${yearLabel}`, 'MMMM YYYY'), 'month'));

  const handleMonthHasData = (monthLabel, yearLabel) => {
    const month = monthOptions.find((month) => moment
      .utc(month.value)
      .isSame(moment(`${monthLabel} ${yearLabel}`, 'MMMM YYYY'), 'month'));

    return month?.hasData;
  };

  const checkCanClick = (direction) => {
    const currentYearIndex = handleGetYearIndex(yearSelected);

    if (direction > 0) {
      return yearOptions.some(
        (year, index) => currentYearIndex < index && year.hasData,
      );
    }
    return yearOptions
      .slice()
      .reverse()
      .some(
        (year, index) => yearOptions.length - (currentYearIndex + 1) < index && year.hasData,
      );
  };

  const handleSelect = (direction) => {
    if (!checkCanClick(direction)) return;
    const currentYearIndex = handleGetYearIndex(yearSelected);

    let yearLabel = yearSelected;
    let monthLabel = monthSelected;

    let breakLoop = false;

    if (direction > 0) {
      yearOptions.forEach((year, index) => {
        if (currentYearIndex < index && year.hasData && !breakLoop) {
          yearLabel = year.label;
          breakLoop = true;
        }
      });

      if (!handleMonthHasData(monthLabel, yearLabel)) {
        const currentMonthIndex = handleGetMonthIndex(monthLabel, yearLabel);

        let breakLoopMonth = false;

        monthOptions.forEach((month, index) => {
          if (currentMonthIndex < index && month.hasData && !breakLoopMonth) {
            monthLabel = month.label;
            breakLoopMonth = true;
          }
        });

        monthOptions
          .slice()
          .reverse()
          .forEach((month, index) => {
            if (
              monthOptions.length - (currentMonthIndex + 1) < index
              && month.hasData
              && !breakLoopMonth
            ) {
              monthLabel = month.label;
              breakLoopMonth = true;
            }
          });
      }
    } else {
      yearOptions
        .slice()
        .reverse()
        .forEach((year, index) => {
          if (
            yearOptions.length - (currentYearIndex + 1) < index
            && year.hasData
            && !breakLoop
          ) {
            yearLabel = year.label;
            breakLoop = true;
          }
        });

      if (!handleMonthHasData(monthLabel, yearLabel)) {
        const currentMonthIndex = handleGetMonthIndex(monthLabel, yearLabel);

        let breakLoopMonth = false;

        monthOptions
          .slice()
          .reverse()
          .forEach((month, index) => {
            if (
              monthOptions.length - (currentMonthIndex + 1) < index
              && month.hasData
              && !breakLoopMonth
            ) {
              monthLabel = month.label;
              breakLoopMonth = true;
            }
          });

        monthOptions.forEach((month, index) => {
          if (currentMonthIndex < index && month.hasData && !breakLoopMonth) {
            monthLabel = month.label;
            breakLoopMonth = true;
          }
        });
      }
    }

    handleChangeDate(`${monthLabel} ${yearLabel}`);
  };

  return (
    <SelectOptionDropdownWrapper>
      {children}
      {open && (
        <ClickAwayListener onClickAway={handleClickOutside}>
          <Dropdown>
            {mode === MONTH_MODE && (
              <DropdownHeader>
                <DropdownYearButtons
                  disabled={!checkCanClick(-1)}
                  onClick={() => !isLoading && handleSelect(-1)}
                >
                  <ArrowLeftIcon />
                </DropdownYearButtons>
                <span
                  style={{
                    fontWeight: '700',
                    fontSize: '18px',
                    color: '#181842',
                    fontFamily: 'Inter',
                  }}
                >
                  {moment(yearSelected).format('YYYY')}
                </span>
                <DropdownYearButtons
                  disabled={!checkCanClick(1)}
                  onClick={() => !isLoading && handleSelect(1)}
                >
                  <ArrowRightIcon />
                </DropdownYearButtons>
              </DropdownHeader>
            )}
            <DropdownContent>
              {mode === YEAR_MODE
                && yearOptions.map((year) => (
                  <DropdownOption
                    key={`year-dropdown-${year.label}`}
                    selected={yearSelected === year.label}
                    disabled={!year.hasData}
                    onClick={() => !isLoading
                      && year.hasData
                      && handleChangeDate(`${monthSelected} ${year.label}`)}
                  >
                    {year.label}
                  </DropdownOption>
                ))}
              {mode === MONTH_MODE
                && monthOptions.map((month) => {
                  if (yearSelected === moment(month.value).format('YYYY')) {
                    return (
                      <DropdownOption
                        key={`month-dropdown-${month.value}`}
                        selected={monthSelected === month.label}
                        disabled={!month.hasData}
                        onClick={() => !isLoading
                          && month.hasData
                          && handleChangeDate(`${month.label} ${yearSelected}`)}
                      >
                        {capitalizeFirstLetter(
                          moment(month.label, 'MMMM').format('MMM'),
                        )}
                      </DropdownOption>
                    );
                  }
                })}
            </DropdownContent>
          </Dropdown>
        </ClickAwayListener>
      )}
    </SelectOptionDropdownWrapper>
  );
};
