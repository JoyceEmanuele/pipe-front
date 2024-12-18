import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { Flex } from 'reflexbox';
import {
  Button,
} from '~/components';
import { useStateVar } from '~/helpers/useStateVar';
import { DateLabel, StyledCalendarIcon } from './DACs/DACHistoric';

import {
  SearchInput,
  Label,
} from './DACs/Machines/styles';
import { ContentDate, DielTool } from './styles';
import { SingleDatePicker } from 'react-dates';
import moment from 'moment';

export interface FilterItem {
  label: string,
  placeholder: string
  options: { value: string, name: string, icon?: JSX.Element }[],
  type?: string,
  value: string | string[],
  onChange: (e?) => void,
  index: number,
  uniqueSelect?: boolean,
  dateMoment?: moment.Moment | null,
}

export const AnalysisFilters = (props: { filters: FilterItem[], isLoading: boolean, onApply: () => void, dielTool?: boolean }): JSX.Element => {
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar(() => {
    const state = {
      filters: [] as FilterItem[],
      isLoading: true as boolean,
      focused: {} as {
        id: string,
        focused: boolean,
      },
      dateValuePicker: {} as {
        startDate: moment.Moment | null,
        endDate: moment.Moment | null,
      },
      tomorrow: moment(moment().add(1, 'days').format('YYYY-MM-DD')),
    };
    return state;
  });

  const getSelectedDate = (opt, state) => {
    if (opt.label === t('inicioOperacao') && state.dateValuePicker.startDate) {
      return state.dateValuePicker.startDate;
    // eslint-disable-next-line no-else-return
    } else if (opt.label === t('fimOperacao') && state.dateValuePicker.endDate) {
      return state.dateValuePicker.endDate;
    } else if (moment(opt.value).isValid()) {
      return moment(opt.value);
    }
    return null;
  };

  const setOnChange = (opt, data) => {
    if (opt.label === t('inicioOperacao')) {
      state.dateValuePicker.startDate = data;
    } else {
      state.dateValuePicker.endDate = data;
    }
  };

  useEffect(() => {
    const sortedFilters = props.filters.sort((a, b) => a.index - b.index);
    setState({ filters: sortedFilters, isLoading: props.isLoading });
    render();
  }, [props]);

  function renderOption(props, option, snapshot, className) {
    return (
      <button {...props} className={className} type="button">
        <div style={{
          display: 'flex', flexFlow: 'row nowrap', alignItems: 'center',
        }}
        >
          {option.icon}
          <span style={{ marginLeft: '10px' }}>{option.name}</span>
        </div>
      </button>
    );
  }

  return (
    <>
      <Flex flexWrap="wrap" alignItems="center">
        <div style={{ display: 'flex', flexFlow: 'row wrap' }}>
          {state.filters.map((opt) => (
            opt.type !== 'date'
              ? (
                <SearchInput style={{ width: 'auto' }} key={opt.label}>
                  <div style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }}>
                    <Label>{opt.label}</Label>
                    <SelectSearch
                      options={opt.options || []}
                      value={opt.value}
                      multiple={!opt.uniqueSelect}
                      closeOnSelect
                      printOptions="on-focus"
                      search
                      filterOptions={fuzzySearch}
                      placeholder={opt.placeholder}
                  // eslint-disable-next-line react/jsx-no-bind
                      onChange={opt.onChange}
                  // onBlur={onFilterUnitBlur}
                      disabled={state.isLoading}
                      renderOption={opt.options[0]?.icon ? renderOption : undefined}
                    />
                  </div>
                </SearchInput>
              )
              : (
                <>
                  <ContentDate
                    style={{
                      marginLeft: '16px',
                    }}
                    key={opt.label}
                  >
                    <DateLabel>{opt.label}</DateLabel>
                    <br />
                    <SingleDatePicker
                      disabled={state.isLoading}
                      date={getSelectedDate(opt, state)}
                      onDateChange={(data) => {
                        setOnChange(opt, data);
                        opt.onChange(data);
                        render();
                      }}
                      focused={state.focused.id === opt.label ? state.focused.focused : false}
                      onFocusChange={({ focused }) => {
                        setState({ focused: { id: opt.label, focused } });
                        render();
                      }}
                      numberOfMonths={1}
                      displayFormat="DD/MM/YYYY"
                      isOutsideRange={(d) => {
                        if (opt.label === t('fimOperacao') && state.dateValuePicker.startDate) {
                          return d.isBefore(state.dateValuePicker.startDate);
                        }
                        return d.isAfter(state.dateValuePicker.endDate);
                      }}
                      placeholder={opt.placeholder}
                    />
                    <StyledCalendarIcon color="#202370" />
                  </ContentDate>
                </>
              )
          ))}
        </div>
        <DielTool
          className="dielTool"
        >
          { !props.dielTool && state.filters.length > 0 && (
            <Button
              style={{
                marginLeft: '10px', height: '80%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '5px', marginBottom: '5px',
              }}
              type="button"
              variant={state.isLoading ? 'disabled' : 'primary'}
              onClick={props.onApply}
            >
              {t('botaoFiltrar')}
            </Button>
          )}
        </DielTool>
      </Flex>
    </>
  );
};
